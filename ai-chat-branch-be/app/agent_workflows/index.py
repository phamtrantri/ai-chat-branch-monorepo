from typing import List, Dict, Any

from agents import RunResult, RunResultStreaming
from app.agent_workflows.constants import AGENTIC_MODE
from app.agent_workflows.interface import AgentWorkflowInterface
from app.agent_workflows.chain_of_thought import ChainOfThoughtWorkflow
from app.agent_workflows.tree_of_thoughts.index import TreeOfThoughtsWorkflow
from app.agent_workflows.think_longer import ThinkLongerWorkflow
from app.agent_workflows.deep_research.index import DeepResearchWorkflow
from app.agent_workflows.default import DefaultWorkflow
from app.agent_workflows.summary import SummaryWorkflow

class Context:
  _workflow: AgentWorkflowInterface

  def set_workflow(self, workflow: AgentWorkflowInterface):
    self._workflow = workflow

  async def execute_workflow(self, query: List[dict]):
    return await self._workflow.execute(query)

  async def execute_workflow_streamed(self, query: List[dict]):
    return await self._workflow.execute_streamed(query)

class AgentWorkflows:
    context: Context
    def __init__(self, agentic_mode: AGENTIC_MODE | None = None, model_settings: Dict[str, Any] | None = None):
        self.context = Context()
        self.set_workflow(agentic_mode=agentic_mode, model_settings=model_settings)

    def set_workflow(self, agentic_mode: AgentWorkflowInterface, model_settings: Dict[str, Any] | None = None):
        if agentic_mode == AGENTIC_MODE.CHAIN_OF_THOUGHT:
            self.context.set_workflow(ChainOfThoughtWorkflow(model_settings=model_settings))
        elif agentic_mode == AGENTIC_MODE.TREE_OF_THOUGHTS:
            self.context.set_workflow(TreeOfThoughtsWorkflow(model_settings=model_settings))
        elif agentic_mode == AGENTIC_MODE.THINK_LONGER:
            self.context.set_workflow(ThinkLongerWorkflow(model_settings=model_settings))
        elif agentic_mode == AGENTIC_MODE.DEEP_RESEARCH:
            self.context.set_workflow(DeepResearchWorkflow(model_settings=model_settings))
        elif agentic_mode == AGENTIC_MODE.SUMMARY:
            self.context.set_workflow(SummaryWorkflow(model_settings=model_settings))
        else:
            self.context.set_workflow(DefaultWorkflow(model_settings=model_settings))

    async def run(self, query: List[dict]) -> RunResult:
        return await self.context.execute_workflow(query)
    async def run_streamed(self, query: List[dict]) -> RunResultStreaming:
        return await self.context.execute_workflow_streamed(query)

