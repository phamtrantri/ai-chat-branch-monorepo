from contextlib import asynccontextmanager
from typing import Any, Dict
from dotenv import load_dotenv
from fastapi import FastAPI
import json
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from openai.types.responses import ResponseReasoningSummaryTextDeltaEvent, ResponseTextDeltaEvent
from pydantic import BaseModel
from app.db import db
from app.agent_workflows.constants import AGENTIC_MODE
from app.agent_workflows.index import AgentWorkflows
from app.prompts.index import Prompt
from app.prompts.constants import PromptMode

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

@app.get("/")
async def root():
    agent_workflows = AgentWorkflows()

    result = await agent_workflows.run_streamed("Write a haiku about recursion in programming.")
    full_response = ""
    async for event in result.stream_events():
        if event.type == "raw_response_event" and isinstance(event.data, ResponseTextDeltaEvent):
            full_response += event.data.delta
    return {
        "code": 0,
        "data": {
            "content": full_response
        }
    }

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
    if not conversation:
        return []

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
    agent_workflows = AgentWorkflows()
    result = await agent_workflows.run([{"role": "user", "content": body.first_msg + "\nSummarize the user query in less than 10 words. DO NOT use bullet point list, stages or steps."}], AGENTIC_MODE.SUMMARY)
    
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
    agentic_mode: AGENTIC_MODE | None = None
    prompt_mode: PromptMode | None = None
    extra_data: Dict[str, Any] | None = None


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
        # Get conversation
        conversation = await db.fetch_one("SELECT * from conversations WHERE id = %s", (body.conversation_id,))
        history = []
        # means conversation is a thread
        if (conversation["message_id"]):
            history = await getThreadHistory(conversation)
        else:
            history = await db.fetch_all("SELECT content, role from messages WHERE conversation_id = %s ORDER BY created_at ASC", (body.conversation_id,))

        if (not body.is_new_conversation):
            # Insert user message first
            if (body.prompt_mode == PromptMode.REPLY):
                await db.execute("INSERT INTO messages (content, conversation_id, role, num_of_children, referred_message_id, referred_message_content) VALUES (%s, %s, %s, %s, %s, %s)", (body.user_message, body.conversation_id, "user", 0, body.extra_data["referred_message"]["id"], body.extra_data["sub_str"],))
            else:
                await db.execute("INSERT INTO messages (content, conversation_id, role, num_of_children) VALUES (%s, %s, %s, %s)", (body.user_message, body.conversation_id, "user", 0,))

        # Prepare assistant placeholder to obtain message id
        
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
        prompt_strategy = Prompt()
        agent_workflows = AgentWorkflows()
        
        query = prompt_strategy.prepare(body.user_message, history, body.prompt_mode, body.extra_data)
        result = await agent_workflows.run_streamed(query, body.agentic_mode)
        
        full_response = ""
        full_reasoning_summary = ""
        # Stream the response
        async for event in result.stream_events():
            if event.type == "raw_response_event" and isinstance(event.data, ResponseTextDeltaEvent):
                full_response += event.data.delta
                yield json.dumps({"message_id": message_id, "content": event.data.delta, "type": "real_content"}) + "\n"
            elif event.type == "raw_response_event" and isinstance(event.data, ResponseReasoningSummaryTextDeltaEvent):
                full_reasoning_summary += event.data.delta
                yield json.dumps({"message_id": message_id, "content": event.data.delta, "type": "reasoning_summary"}) + "\n"
                
        # Update assistant message with full content after streaming completes
        await db.execute("UPDATE messages SET content = %s, reasoning_summary = %s WHERE id = %s", (full_response, None if full_reasoning_summary == "" else full_reasoning_summary, message_id,))
        
    return StreamingResponse(
        generate_stream(),
        media_type="application/json",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

@app.post("/test/treeOfThoughts")
async def createTreeOfThoughts(body: CreateMessageReq):
    agent_workflows = AgentWorkflows()
    result = await agent_workflows.run(body.user_message, AGENTIC_MODE.TREE_OF_THOUGHTS)
    return {
        "code": 0,
        "data": {
            "result": result
        }
    }

@app.post("/test/thinkLonger")
async def createThinkLonger(body: CreateMessageReq):
    agent_workflows = AgentWorkflows()
    result = await agent_workflows.run(body.user_message, AGENTIC_MODE.THINK_LONGER)
    return {
        "code": 0,
        "data": {
            "result": result
        }
    }

@app.post("/test/deepResearch")
async def createDeepResearch(body: CreateMessageReq):
    agent_workflows = AgentWorkflows()
    result = await agent_workflows.run(body.user_message, AGENTIC_MODE.DEEP_RESEARCH)
    return {
        "code": 0,
        "data": {
            "result": result
        }
    }