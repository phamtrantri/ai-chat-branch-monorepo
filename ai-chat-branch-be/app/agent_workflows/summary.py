from app.agent_workflows.interface import AgentWorkflowInterface
from agents import Agent, Runner, trace
from typing import List


class SummaryWorkflow(AgentWorkflowInterface):
    agent: Agent
    def __init__(self):
        self.agent = Agent(
            name="Summary Agent",
            instructions="You are an expert in summarizing. \
You summarize the user query in a precise and concise way. \
You try to use bullet point list, stages or steps to capture the essence of the user query unless the user told you otherwise. \
DO NOT address or solve the query",
            tools=[],
            model="gpt-4o-mini",
        )


    async def execute(self, query: List[dict]):
        with trace("Summary workflow non streamed"):
            return await Runner.run(self.agent, query)
        
    async def execute_streamed(self, query: List[dict]):
        with trace("Summary workflow"):
            return Runner.run_streamed(self.agent, query)


