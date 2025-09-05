from app.agent_workflows.interface import AgentWorkflowInterface
from typing import List


class DeepResearchWorkflow(AgentWorkflowInterface):
    async def execute(self, query: List[dict]):
        pass


