from app.agent_workflows.interface import AgentWorkflowInterface
from agents import Agent, ModelSettings, Runner, trace
from app.utils.prompt import build_instruction

class ThinkLongerWorkflow(AgentWorkflowInterface):
    agent: Agent
    def __init__(self):
        instructions = build_instruction(approach_instruction="You think carefully and reason step by step and be more detailed.")
        self.agent = Agent(
            name="Think Longer Assistant",
            instructions=instructions,
            tools=[],
            model="o3-mini",
        )

    async def execute(self, query: str, history=None):
        if history is None:
            history = []
        with trace("Think Longer workflow non streamed"):
            result = await Runner.run(self.agent, history + [{"role": "user", "content": query}])
            return result
    
    async def execute_streamed(self, query: str, history=None):
        if history is None:
            history = []
        with trace("Think Longer workflow"):
            result = Runner.run_streamed(self.agent, history + [{"role": "user", "content": query}])
            return result
