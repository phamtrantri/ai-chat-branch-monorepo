from app.agent_workflows.interface import AgentWorkflowInterface


class ThinkLongerWorkflow(AgentWorkflowInterface):
    async def execute(self, query: str, history=None):
        pass


