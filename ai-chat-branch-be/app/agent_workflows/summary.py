from app.agent_workflows.interface import AgentWorkflowInterface
from agents import Agent, Runner, trace


class SummaryWorkflow(AgentWorkflowInterface):
    agent: Agent
    def __init__(self):
        self.agent = Agent(
            name="Summary Assistant",
            instructions="You are an expert in summarizing. \
You summarize the user query in a precise and concise way. \
You try to use bullet point list, stages or steps to capture the essence of the user query unless the user told you otherwise. \
DO NOT address or solve the query",
            tools=[],
            model="gpt-4o-mini",
        )


    async def execute(self, query: str, history=None):
        with trace("Summary workflow"):
            return await Runner.run(self.agent, [{"role": "user", "content": query}])
        
    async def execute_streamed(self, query: str, history=None):
        pass


