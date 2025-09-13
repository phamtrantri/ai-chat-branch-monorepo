import os
from agents.extensions.models.litellm_model import LitellmModel
from app.agent_workflows.interface import AgentWorkflowInterface
from agents import Agent, Runner, trace
from app.agent_workflows.agents_and_tools.index import web_search_agent_tool
from app.utils.prompt import build_instruction
from app.utils.model import get_model_api_key
from typing import Any, Dict, List

class DefaultWorkflow(AgentWorkflowInterface):
    agent: Agent
    def __init__(self, model_settings: Dict[str, Any] | None = None):
        instructions = build_instruction(approach_instruction=None)
        self.agent = Agent(
            name="Default Agent",
            instructions=instructions,
            tools=[web_search_agent_tool],
            model=self.get_model(model_settings=model_settings),
        )

    def get_model(self, model_settings: Dict[str, Any] | None = None):
        if (not model_settings):
            return LitellmModel(
                model="openai/gpt-4o-mini",
                api_key=os.getenv("OPENAI_API_KEY")
            )

        api_key = get_model_api_key(model_settings["model"])
        return LitellmModel(
            model=model_settings["model"],
            api_key=api_key
        )

    async def execute(self, query: List[dict]):
        pass
    
    async def execute_streamed(self, query: List[dict]):
        with trace("Default workflow"):
            result = Runner.run_streamed(self.agent, query)
            return result
