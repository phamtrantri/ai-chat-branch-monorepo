from agents.extensions.models.litellm_model import LitellmModel
from app.agent_workflows.interface import AgentWorkflowInterface
from agents import Agent, Runner, trace
from typing import List, Dict, Any
import os
from app.utils.model import get_model_api_key


class SummaryWorkflow(AgentWorkflowInterface):
    agent: Agent
    def __init__(self, model_settings: Dict[str, Any] | None = None):
        self.agent = Agent(
            name="Summary Agent",
            instructions="You are an expert in summarizing. \
You summarize the user query in a precise and concise way. \
You try to use bullet point list, stages or steps to capture the essence of the user query unless the user told you otherwise. \
DO NOT address or solve the query",
            tools=[],
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
        with trace("Summary workflow non streamed"):
            return await Runner.run(self.agent, query)
        
    async def execute_streamed(self, query: List[dict]):
        with trace("Summary workflow"):
            return Runner.run_streamed(self.agent, query)


