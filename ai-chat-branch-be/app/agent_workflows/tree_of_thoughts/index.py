import asyncio
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
from agents import Agent, Runner, trace
from app.agent_workflows.interface import AgentWorkflowInterface
from app.agent_workflows.tree_of_thoughts.agents import Finalization, evaluate_thought, generate_thoughts, tot_evaluator_agent, tot_executioner_agent, tot_reasoner_agent

@dataclass
class ToTConfig:
    beam_width: int = 3          # keep top-B at each depth
    max_depth: int = 3           # limit tree depth
    thoughts_per_step: int = 3   # k
    eval_enabled: bool = True    # whether to run evaluate_thought
    min_keep_score: float = 0.8 # prune weak branches early

@dataclass
class Node:
    path: List[str]                 # sequence of thoughts up to here
    score: float                    # aggregate score
    meta: Dict[str, Any] = field(default_factory=dict)



class TreeOfThoughtsWorkflow(AgentWorkflowInterface):
    tot_reasoner_agent: Agent
    tot_evaluator_agent: Agent
    tot_executioner_agent: Agent
    is_streamed: bool = False

    def __init__(self):
        self.tot_reasoner_agent = tot_reasoner_agent
        self.tot_evaluator_agent = tot_evaluator_agent
        self.tot_executioner_agent = tot_executioner_agent
        
    async def try_finalize(self, goal: str, frontier: List[Node]) -> Optional[str]:
        if not frontier:
            return None
        
        best = frontier[0]

        prompt = (
            "You are given with the current best path of a tree of thoughts.\n"
            "Task: FINALIZE_THOUGHT\n"
            f"Goal: {goal}\n"
            f"Best path so far: {best.path}\n"
            "If the path is sufficient, reply with finalized=True and why"
            "Otherwise reply with finalized=False and why"
        )
        result = await Runner.run(self.tot_evaluator_agent.clone(output_type=Finalization), prompt)
        if (not result.final_output.finalized):
            return None

        return await self.synthesize_answer(goal, frontier)
    
    async def synthesize_answer(self, goal: str, frontier: List[Node]) -> str:
        if not frontier:
            return "No solution found"
        
        best = frontier[0]

        prompt = (
            "Synthesize a high-quality final answer using the following steps.\n"
            f"Goal: {goal}\n"
            f"Steps: {best.path}\n"
            "Be accurate and cite assumptions."
        )
        result = await Runner.run(self.tot_executioner_agent, prompt)
        return result.final_output

    async def generate_final_thought(self, goal: str, config: ToTConfig = ToTConfig(), history: Optional[List[Dict[str, Any]]] = None):
        trace = {"question": goal, "levels": []}
        frontier: List[Node] = [Node(path=[], score=0.0)]

        for depth in range(config.max_depth):
            next_frontier: List[Node] = []
            level_dump = []

            thought_generation_tasks = [
                generate_thoughts(goal=goal, current_path=node.path, k=config.thoughts_per_step)
                for node in frontier
            ]
            thought_batches = await asyncio.gather(*thought_generation_tasks)

            # Prepare evaluation tasks if evaluation is enabled
            eval_tasks = []
            
            for batch, node in zip(thought_batches, frontier):
                for thought in batch.thoughts:
                    if config.eval_enabled:
                        eval_tasks.append(
                            evaluate_thought(goal=goal, path_so_far=node.path, candiate=thought.text)
                        )

            eval_results = []
            if eval_tasks:
                eval_results = await asyncio.gather(*eval_tasks)

            # Process results and build next frontier
            eval_index = 0
            for (batch, node) in zip(thought_batches, frontier):
                kept: List[Node] = []
                
                for thought in batch.thoughts:
                    score = thought.score
                    
                    if config.eval_enabled and eval_index < len(eval_results):
                        eval_result = eval_results[eval_index]
                        eval_index += 1
                        score = (eval_result.adjusted_score + score) / 2.0
                        keep = eval_result.keep and score >= config.min_keep_score
                        reason = eval_result.reason
                    else:
                        keep = score >= config.min_keep_score
                        reason = "kept by initial score"
                    
                    level_dump.append({
                        "parent_path": node.path,
                        "candidate": thought.model_dump(),
                        "eval_reason": reason,
                        "kept": keep,
                        "depth": depth
                    })

                    if keep:
                        kept.append(Node(path=node.path + [thought.text], score=(node.score + score)/2.0))
                
                kept.sort(key=lambda n: n.score, reverse=True)
                next_frontier.extend(kept[:config.beam_width])
            
            next_frontier.sort(key=lambda n: n.score, reverse=True)
            frontier = next_frontier[:config.beam_width]
            trace["levels"].append(level_dump)
            maybe_complete = await self.try_finalize(goal, frontier)
            if maybe_complete:
                final = maybe_complete
                break
        else:
            # if no early return, take the best path so far
            final = await self.synthesize_answer(goal, frontier)
        
        return final, trace
        

    async def execute(self, query: str, history=None):
        with trace("Tree-of-Thoughts workflow non streamed"):
            return await self.generate_final_thought(query, ToTConfig(), history)
      
    async def execute_streamed(self, query: str, history=None):
        # self.is_streamed = True
        # with trace("Tree-of-Thoughts workflow"):
        #     result = await self.generate_final_thought(query, ToTConfig(), history)
        #     return result
        pass
