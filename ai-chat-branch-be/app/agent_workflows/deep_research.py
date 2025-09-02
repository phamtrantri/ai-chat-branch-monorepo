from app.agent_workflows.interface import AgentWorkflowInterface


class DeepResearchWorkflow(AgentWorkflowInterface):
    async def execute(self, query: str, history=None):
        pass


