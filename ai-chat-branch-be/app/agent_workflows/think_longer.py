from app.agent_workflows.interface import AgentWorkflowInterface
from agents import Agent, Runner, trace, WebSearchTool
from app.utils.prompt import build_instruction
from typing import List

class ThinkLongerWorkflow(AgentWorkflowInterface):
    agent: Agent
    def __init__(self):
        instructions = build_instruction(approach_instruction="You think carefully and reason step by step and be more detailed.")
        self.agent = Agent(
            name="Think Longer Assistant",
            instructions=instructions,
            model="o3-mini",
        )

    async def execute(self, query: List[dict]):
        with trace("Think Longer workflow non streamed"):
            result = await Runner.run(self.agent, query)
            return result
    
    async def execute_streamed(self, query: List[dict]):
        with trace("Think Longer workflow"):
            result = Runner.run_streamed(self.agent, query)
            return result
