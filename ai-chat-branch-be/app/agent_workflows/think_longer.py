from openai.types.shared import Reasoning
from app.agent_workflows.interface import AgentWorkflowInterface
from agents import Agent, ModelSettings, Runner, trace
from app.utils.prompt import build_instruction
from typing import List
from agents.extensions.models.litellm_model import LitellmModel
import os

class ThinkLongerWorkflow(AgentWorkflowInterface):
    agent: Agent
    def __init__(self):
        instructions = build_instruction(approach_instruction="You think carefully and reason step by step and be more detailed.")
        self.agent = Agent(
            name="Think Longer Assistant",
            instructions=instructions,
            model=LitellmModel(
                model="deepseek/deepseek-reasoner",
                api_key=os.getenv("DEEPSEEK_API_KEY")
            ),
            model_settings=ModelSettings(
                reasoning=Reasoning(
                    summary="concise"
                )
            ),
        )

    async def execute(self, query: List[dict]):
        with trace("Think Longer workflow non streamed"):
            result = await Runner.run(self.agent, query)
            return result
    
    async def execute_streamed(self, query: List[dict]):
        with trace("Think Longer workflow"):
            result = Runner.run_streamed(self.agent, query)
            return result
