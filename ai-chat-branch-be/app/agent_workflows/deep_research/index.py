from agents import Agent, Runner, trace
from app.agent_workflows.interface import AgentWorkflowInterface
from typing import List, Dict, Any
from app.agent_workflows.deep_research.agents import triage_agent, clarifying_agent, instruction_agent, research_agent


class DeepResearchWorkflow(AgentWorkflowInterface):
    triage_agent: Agent
    clarifying_agent: Agent
    research_instruction_agent: Agent
    deep_research_agent: Agent

    def __init__(self, model_settings: Dict[str, Any] | None = None):
        #TODO set model_settings
        self.triage_agent = triage_agent
        self.clarifying_agent = clarifying_agent
        self.research_instruction_agent = instruction_agent
        self.deep_research_agent = research_agent

    async def deep_research(self, query: List[dict]):
        result = await Runner.run(self.triage_agent, query)
        if (result.final_output.need_clarify):
            result = await Runner.run(self.clarifying_agent, query)
        else:
            instruction = await Runner.run(self.research_instruction_agent, query)
            result = await Runner.run(self.deep_research_agent, instruction.final_output)
        return result

    async def deep_research_streamed(self, query: List[dict]):
        result = await Runner.run(self.triage_agent, query)
        if (result.final_output.need_clarify):
            result = Runner.run_streamed(self.clarifying_agent, query)
        else:
            instruction = await Runner.run(self.research_instruction_agent, query)
            result = Runner.run_streamed(self.deep_research_agent, instruction.final_output)
        return result

    async def execute(self, query: List[dict]):
        with trace("Deep Research workflow non streamed"):
            result = await self.deep_research(query)
            return result
    async def execute_streamed(self, query: List[dict]):
        with trace("Deep Research workflow"):
            result = await self.deep_research_streamed(query)
            return result


