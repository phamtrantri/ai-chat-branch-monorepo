from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
from agents import Agent, Runner
from app.agent_workflows.interface import AgentWorkflowInterface
from app.agent_workflows.tree_of_thoughts.agents import evaluate_thought, generate_thoughts, tot_reasoner_agent

@dataclass
class ToTConfig:
    beam_width: int = 1          # keep top-B at each depth
    max_depth: int = 3           # limit tree depth
    thoughts_per_step: int = 3   # k
    eval_enabled: bool = True    # whether to run evaluate_thought
    min_keep_score: float = 0.35 # prune weak branches early

@dataclass
class Node:
    path: List[str]                 # sequence of thoughts up to here
    score: float                    # aggregate score
    meta: Dict[str, Any] = field(default_factory=dict)



class TreeOfThoughtsWorkflow(AgentWorkflowInterface):
    tot_reasoner_agent: Agent
    def __init__(self):
        self.tot_reasoner_agent = tot_reasoner_agent

    async def try_finalize(self, goal: str, frontier: List[Node]) -> Optional[str]:
        if not frontier:
            return None
        best = frontier[0]
        prompt = (
            "You have been reasoning with intermediate steps (a tree of thoughts).\n"
            f"Goal: {goal}\n"
            f"Best path so far: {best.path}\n"
            "If the path is sufficient, produce the final answer now. "
            "Otherwise reply with ONLY the single token: CONTINUE"
        )
        result = await Runner.run(self.tot_reasoner_agent.clone(), prompt)
        out = result.final_output.strip() if isinstance(result.final_output, str) else ""

        return None if out == "CONTINUE" else out


    
    async def synthesize_answer(self, goal: str, path: List[str]) -> str:
        prompt = (
            "Synthesize a high-quality final answer using the following steps.\n"
            f"Goal: {goal}\n"
            f"Steps: {path}\n"
            "Be accurate and cite assumptions."
        )
        result = await Runner.run(self.tot_reasoner_agent.clone(), prompt)
        return result.final_output

    async def generate_final_thought(self, goal: str, config: ToTConfig = ToTConfig(), history: Optional[List[Dict[str, Any]]] = None):
        trace = {"question": goal, "levels": []}
        frontier: List[Node] = [Node(path=[], score=0.0)]

        for depth in range(config.max_depth):
            next_frontier: List[Node] = []
            level_dump = []

            for node in frontier:
                batch = await generate_thoughts(goal=goal, current_path=node.path, k=config.thoughts_per_step)
                kept: List[Node] = []
                for thought in batch.thoughts:
                    score = thought.score
                    if config.eval_enabled:
                        eval_result = await evaluate_thought(goal=goal, path_so_far=node.path, candiate=thought.text)
                        score = (eval_result.adjusted_score + score) / 2.0
                        keep = eval_result.keep and score >= config.min_keep_score
                        reason = eval_result.reason
                    else:
                        keep = score >= config.min_keep_score
                        reason = "kept by initial score" if not config.eval_enabled else eval_result.reason
                    
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
            final = await self.synthesize_answer(goal, frontier[0].path if frontier else [])
        
        return final, trace
        

    async def execute(self, query: str, history=None):
        return await self.generate_final_thought(query, ToTConfig(), history)
      
    async def execute_streamed(self, query: str, history=None):
        pass