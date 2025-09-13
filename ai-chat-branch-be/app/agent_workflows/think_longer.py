from openai.types.shared import Reasoning
from app.agent_workflows.interface import AgentWorkflowInterface
from agents import Agent, ModelSettings, Runner, trace
from app.utils.prompt import build_instruction
from typing import List, Dict, Any
from agents.extensions.models.litellm_model import LitellmModel
from app.utils.model import get_model_api_key
import os
from app.agent_workflows.agents_and_tools.index import web_search_agent_tool


class ThinkLongerWorkflow(AgentWorkflowInterface):
    agent: Agent
    def __init__(self, model_settings: Dict[str, Any] | None = None):
        instructions = build_instruction(approach_instruction="You think carefully and reason step by step and be more detailed.")
        
        self.agent = Agent(
            name="Think Longer Agent",
            instructions=instructions,
            model=self.get_model(model_settings=model_settings),
            model_settings=ModelSettings(
                reasoning=Reasoning(
                    summary="concise",
                )
            ),
        )
    
    def get_model(self, model_settings: Dict[str, Any] | None = None):
        if (not model_settings):
            return LitellmModel(
                model="deepseek/deepseek-reasoner",
                api_key=os.getenv("DEEPSEEK_API_KEY")
            )

        api_key = get_model_api_key(model_settings["model"])
        return LitellmModel(
            model=model_settings["model"],
            api_key=api_key
        )


    async def execute(self, query: List[dict]):
        with trace("Think Longer workflow non streamed"):
            result = await Runner.run(self.agent, query)
            return result
    
    async def execute_streamed(self, query: List[dict]):
        with trace("Think Longer workflow"):
            result = Runner.run_streamed(self.agent, query)
            return result
