from typing import List
from app.agent_workflows.interface import AgentWorkflowInterface
from agents import Agent, Runner, trace
from app.utils.prompt import build_instruction

class ChainOfThoughtWorkflow(AgentWorkflowInterface):
    agent: Agent
    def __init__(self):
        instructions = build_instruction(approach_instruction="You solve the problem step by step (chain of thought technique). You break down your reasoning into smaller steps before reaching the conclusion.")
        self.agent = Agent(
            name="Chain of Thought Assistant",
            instructions=instructions,
            tools=[],
            model="gpt-4o-mini",
        )

    async def execute(self, query: List[dict]):
        pass
    
    async def execute_streamed(self, query: List[dict]):
        with trace("Chain-of-Thought workflow"):
            result = Runner.run_streamed(self.agent, query)
            return result
