from app.agent_workflows.interface import AgentWorkflowInterface
from agents import Agent, Runner
from app.utils.prompt import build_instruction

class DefaultWorkflow(AgentWorkflowInterface):
    agent: Agent
    def __init__(self):
        instructions = build_instruction(approach_instruction=None)
        self.agent = Agent(
            name="Default Assistant",
            description="A workflow that uses a default approach to solve a problem",
            instructions=instructions,
            tools=[],
            # model="gpt-4o-mini",
        )

    async def execute(self, query: str, history=None):
        pass
    
    async def execute_streamed(self, query: str, history=None):
        if history is None:
            history = []
        
        result = Runner.run_streamed(self.agent, history + [{"role": "user", "content": query}])
        return result
