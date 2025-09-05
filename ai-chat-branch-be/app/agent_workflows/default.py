from app.agent_workflows.interface import AgentWorkflowInterface
from agents import Agent, Runner, trace
from app.utils.prompt import build_instruction
from typing import List

class DefaultWorkflow(AgentWorkflowInterface):
    agent: Agent
    def __init__(self):
        instructions = build_instruction(approach_instruction=None)
        self.agent = Agent(
            name="Default Assistant",
            instructions=instructions,
            tools=[],
            model="gpt-4o-mini",
        )

    async def execute(self, query: List[dict]):
        pass
    
    async def execute_streamed(self, query: List[dict]):
        with trace("Default workflow"):
            result = Runner.run_streamed(self.agent, query)
            return result
