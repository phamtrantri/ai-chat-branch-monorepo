import asyncio
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from agents import Agent, Runner, WebSearchTool
from fastapi import FastAPI
import json
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from openai.types.responses import ResponseTextDeltaEvent
from pydantic import BaseModel
from app.db import db

load_dotenv(override=True)
origins = [
    "*",
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await db.connect()
    yield
    # Shutdown
    await db.disconnect()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = Agent(name="Assistant", instructions=f"You are a helpful assistant. \
    You try to give answers as precise as possible, in professional tone. \
    You elaborate your asnwer using systematic approach. \
    Try to give example to support your answer. \
    You give the answers in markdown format, use bullet point list with clear headers (E.g.: #, ##, etc...) and separators between sections \
    At the end of your answer, ask user follow up questions, diving to topics, or expanding the conversations", 
    # tools=[WebSearchTool()]
    )

summarizeAgent = Agent(name="Summarize Agent", instructions="You are a helpful assistant. Summarize the user query in less than 10 words. DO NOT address or solve the query")

@app.get("/")
async def root():
    result = await Runner.run(agent, "Write a haiku about recursion in programming.")
    return {"message": result.final_output, "code": "Hello"}

# get conversations - done
# get one conversations - done
# get nested msg in a parent msg - done
# create conversation - done
# create first level msg - done
# create nested msg


class ConversationCreate(BaseModel):
    name: str | None = None
    message_id: int | None = None
    first_msg: str

class ConversationDetails(BaseModel):
    id: int

@app.post("/conversations/v1/getAll")
async def getConversations():
    conversations = await db.fetch_all("SELECT * from conversations ORDER BY created_at DESC")
    return {
        "code": 0, 
        "data": {
            "conversations": conversations
        }
    }

async def getConversationPath(body: ConversationDetails):
    conversation = await db.fetch_one("SELECT id, name, message_id FROM conversations WHERE id = %s", (body.id,))
    path = [{"id": conversation["id"], "name": conversation["name"], "message_id": conversation["message_id"]}]
    while (conversation["message_id"]):
        message = await db.fetch_one("SELECT id, content, conversation_id from messages WHERE id = %s", (conversation["message_id"],))
        conversation = await db.fetch_one("SELECT id, name, message_id from conversations WHERE id = %s", (message["conversation_id"],))
        path.append({"id": conversation["id"], "name": conversation["name"], "message_id": conversation["message_id"]})

    return path        


@app.post("/conversations/v1/getDetails")
async def getConversationDetails(body: ConversationDetails):
    messages = await db.fetch_all(
        """
        SELECT m.*,
        COALESCE(cc.child_conversations, '[]'::json) AS child_conversations
        FROM messages AS m
        LEFT JOIN LATERAL (
            SELECT json_agg(
                json_build_object('id', c.id, 'name', c.name)
                ORDER BY c.created_at
            ) AS child_conversations
            FROM conversations AS c
            WHERE c.message_id = m.id
        ) AS cc ON TRUE
        WHERE m.conversation_id = %s
        ORDER BY m.created_at;
        """,
        (body.id,)
    )

    path = await getConversationPath(body)
    path.reverse()
    
    return {
        "code": 0,
        "data": {
            "messages": messages,
            "path": path
        }
    }
@app.post("/conversations/v1/create")
async def createConversations(body: ConversationCreate):
    result = await Runner.run(summarizeAgent, body.first_msg)
    new_record = None

    if (not body.message_id):
        new_record = await db.execute("INSERT INTO conversations (name) VALUES (%s) RETURNING *", (result.final_output,), True)
    else:
        new_record = await db.execute("INSERT INTO conversations (name, message_id) VALUES (%s, %s) RETURNING *", (result.final_output, body.message_id,), True)

    await db.execute("INSERT INTO messages (content, conversation_id, role, num_of_children) VALUES (%s, %s, %s, %s)", (body.first_msg, new_record[0]["id"], "user", 0,))

    return {
        "code": 0,
        "data": {
            "conversation": new_record[0]
        }
    }

class CreateMessageReq(BaseModel):
    conversation_id: int
    user_message: str
    is_new_conversation: bool


async def getThreadHistory(thread):
    conversation = thread
    history = []
    while (conversation["message_id"]):
        message = await db.fetch_one("SELECT * from messages WHERE id = %s", (conversation["message_id"],))
        conversation = await db.fetch_one("SELECT * from conversations WHERE id = %s", (message["conversation_id"],))

        currHistory = await db.fetch_all("SELECT content, role from messages WHERE conversation_id = %s AND created_at <= %s ORDER BY created_at ASC", (conversation["id"], message["created_at"],))
        history += currHistory
    
    return history

@app.post("/messages/v1/create")
async def createMessage(body: CreateMessageReq):
    async def generate_stream():
        if (not body.is_new_conversation):
            # Insert user message first
            await db.execute("INSERT INTO messages (content, conversation_id, role, num_of_children) VALUES (%s, %s, %s, %s)", (body.user_message, body.conversation_id, "user", 0,))
        # Get conversation
        conversation = await db.fetch_one("SELECT * from conversations WHERE id = %s", (body.conversation_id,))
        history = []
        # means conversation is a thread
        if (conversation["message_id"]):
            history = await getThreadHistory(conversation)
            print(history)
        else:
            history = await db.fetch_all("SELECT content, role from messages WHERE conversation_id = %s ORDER BY created_at ASC", (body.conversation_id,))
        
        # Prepare assistant placeholder to obtain message id
        full_response = ""
        new_message = await db.execute(
            "INSERT INTO messages (content, conversation_id, role, num_of_children) VALUES (%s, %s, %s, %s) RETURNING *",
            ("", body.conversation_id, "assistant", 0,),
            True
        )
        
        # Update num_of_children for the parent message
        if conversation["message_id"]:
            await db.execute(
                "UPDATE messages SET num_of_children = num_of_children + 1 WHERE id = %s",
                (conversation["message_id"],)
            )
            
        message_id = new_message[0]["id"]
        
        # Stream the response
        result = Runner.run_streamed(agent, history + [{"role": "user", "content": body.user_message}])
        async for event in result.stream_events():
            if event.type == "raw_response_event" and isinstance(event.data, ResponseTextDeltaEvent):
                full_response += event.data.delta
                yield json.dumps({"message_id": message_id, "content": event.data.delta}) + "\n"
            
        # Update assistant message with full content after streaming completes
        await db.execute("UPDATE messages SET content = %s WHERE id = %s", (full_response, message_id,))
        
    return StreamingResponse(
        generate_stream(),
        media_type="application/json",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )
