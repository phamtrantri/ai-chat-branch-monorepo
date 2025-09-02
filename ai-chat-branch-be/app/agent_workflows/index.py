from app.agent_workflows.constants import AGENTIC_MODE
from app.agent_workflows.interface import AgentWorkflowInterface
from app.agent_workflows.chain_of_thought import ChainOfThoughtWorkflow
from app.agent_workflows.tree_of_thoughts import TreeOfThoughtsWorkflow
from app.agent_workflows.think_longer import ThinkLongerWorkflow
from app.agent_workflows.deep_research import DeepResearchWorkflow
from app.agent_workflows.default import DefaultWorkflow
from app.agent_workflows.summary import SummaryWorkflow

class Context:
  _workflow: AgentWorkflowInterface

  def set_workflow(self, workflow: AgentWorkflowInterface):
    self._workflow = workflow

  async def execute_workflow(self, query: str, history):
    return await self._workflow.execute(query, history)

  async def execute_workflow_streamed(self, query: str, history):
    return await self._workflow.execute_streamed(query, history)

class AgentWorkflows:
    context: Context
    def __init__(self):
        self.context = Context()

    def set_workflow(self, agentic_mode: AgentWorkflowInterface):
        if agentic_mode == AGENTIC_MODE.CHAIN_OF_THOUGHT:
            self.context.set_workflow(ChainOfThoughtWorkflow())
        elif agentic_mode == AGENTIC_MODE.TREE_OF_THOUGHTS:
            self.context.set_workflow(TreeOfThoughtsWorkflow())
        elif agentic_mode == AGENTIC_MODE.THINK_LONGER:
            self.context.set_workflow(ThinkLongerWorkflow())
        elif agentic_mode == AGENTIC_MODE.DEEP_RESEARCH:
            self.context.set_workflow(DeepResearchWorkflow())
        elif agentic_mode == AGENTIC_MODE.SUMMARY:
            self.context.set_workflow(SummaryWorkflow())
        else:
            self.context.set_workflow(DefaultWorkflow())


    async def run(self, query: str, history, agentic_mode: AGENTIC_MODE | None = None):
        self.set_workflow(agentic_mode)

        return await self.context.execute_workflow(query, history)
    async def run_streamed(self, query: str, history, agentic_mode: AGENTIC_MODE | None = None):
        self.set_workflow(agentic_mode)

        return await self.context.execute_workflow_streamed(query, history)

