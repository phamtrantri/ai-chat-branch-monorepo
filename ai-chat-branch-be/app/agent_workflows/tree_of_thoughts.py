from app.agent_workflows.interface import AgentWorkflowInterface


class TreeOfThoughtsWorkflow(AgentWorkflowInterface):
    async def execute(self, query: str, history=None):
        pass


