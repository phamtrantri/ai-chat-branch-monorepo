from agents import Agent, ModelSettings, Runner, SQLiteSession, WebSearchTool, function_tool
from pydantic import BaseModel, Field
from typing import List, Optional, Tuple
from app.utils.prompt import build_instruction


class Thought(BaseModel):
  text: str = Field(..., description="A single coherent intermediate step.")
  rationale: str = Field(..., description="Why this thought might help.")
  score: float = Field(..., ge=0, le=1, description="Self-evaluated promise (0-1).")

class ThoughtBatch(BaseModel):
  thoughts: List[Thought] = Field(..., min_items=1, max_items=10)

class Evaluation(BaseModel):
    keep: bool
    reason: str
    adjusted_score: float = Field(..., ge=0, le=1)

class Finalization(BaseModel):
    finalized: bool = Field(..., description="Whether the path is comprehensive and robust to reach the goal. True if the path is sufficient, False otherwise.")
    reason: str = Field(..., description="Why the path is sufficient or not.")

tot_reasoner_agent = Agent(
    name="ToT-Reasoner",
    instructions=(
        "You are a careful reasoner that solves problems to reach the goal using a Tree-of-Thoughts process.\n"
        "You reason the problems step by step.\n"
        "When asked to GENERATE_THOUGHTS, produce diverse, non-overlapping, non-repetitive intermediate steps to reach the goal.\n"
        "Be concise but precise."
    ),
    model="gpt-4o-mini",
    output_type=ThoughtBatch,
    model_settings=ModelSettings(
        temperature=0.7,
    ),
)

tot_evaluator_agent = Agent(
    name="ToT-Evaluator",
    instructions=(
        "You are a careful and competent evaluator that evaluates the quality of thoughts thoroughly and objectively to reach the goal.\n"
        "You evaluate the quality of the thoughts step by step.\n"
        "When asked to EVALUATE_THOUGHT, judge whether a thought is promising toward the goal.\n"
        "When asked to FINALIZE_THOUGHT, judge whether the path is comprehensive and robust to reach the goal.\n"
        "Be concise but precise."
    ),
    model="gpt-4o-mini",
    output_type=Evaluation,
    model_settings=ModelSettings(
        temperature=0.2,
    )
)

tot_executioner_agent = Agent(
    name="ToT-Executioner",
    instructions=build_instruction(approach_instruction="You produce the final answer. Use web search tool when your information is outdated."),
    model="gpt-4o-mini",
    model_settings=ModelSettings(
        temperature=0.3,
        tool_choice="required"
    ),
    tools=[WebSearchTool()]
)


async def generate_thoughts(goal: str, current_path: List[str], k: int = 3) -> ThoughtBatch:
  prompt = (
    "Task: GENERATE_THOUGHTS\n"
    f"Goal: {goal}\n"
    f"Current path: {current_path}\n"
    f"Produce {k} thoughtful next steps, which are non-repetitive, non-overlapping, with rationales and scores in [0,1]."
  )
  result = await Runner.run(tot_reasoner_agent, prompt)
  return result.final_output


async def evaluate_thought(goal: str, path_so_far: List[str], candiate: str) -> Evaluation:
  prompt = (
    "TASK: EVALUATE_THOUGHT\n"
    f"Goal: {goal}\n"
    f"Current path: {path_so_far}\n"
    f"Candidate thought: {candiate}\n"
    "Return whether to keep it and an adjusted score in [0,1]."
  )

  result = await Runner.run(tot_evaluator_agent, prompt)
  return result.final_output

