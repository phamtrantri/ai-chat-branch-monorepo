from agents import Agent, WebSearchTool
from pydantic import BaseModel, Field
from app.agent_workflows.deep_research.prompts import RESEARCH_INSTRUCTION_AGENT_PROMPT, CLARIFYING_AGENT_PROMPT


class TriageAgentResponse(BaseModel):
    need_clarify: bool = Field(..., description="Whether the user's query needs clarification.")

research_agent = Agent(
    name="Research Agent",
    model="gpt-4o-mini",
    instructions="Perform deep empirical research based on the user's instructions. Always use WebSearchTool to gather evidence before answering.",
    tools=[WebSearchTool()]
)

instruction_agent = Agent(
    name="Research Instruction Agent",
    model="gpt-4o-mini",
    instructions=RESEARCH_INSTRUCTION_AGENT_PROMPT,
)

clarifying_agent = Agent(
    name="Clarifying Questions Agent",
    model="gpt-4o-mini",
    instructions=CLARIFYING_AGENT_PROMPT,
)

triage_agent = Agent(
    name="Triage Agent",
    instructions=(
        "Decide whether clarifications are required.\n"
        "• If yes, return true\n"
        "• If no, return false\n"
    ),
    model="gpt-4o-mini",
    output_type=TriageAgentResponse,
)