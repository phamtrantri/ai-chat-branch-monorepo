from enum import Enum

class AgenticMode(Enum):
    CHAIN_OF_THOUGHT = "cot"
    TREE_OF_THOUGHTS = "tot"
    THINK_LONGER = "think_longer"
    DEEP_RESEARCH = "deep_research"
    SUMMARY = "summary"
    
AGENTIC_MODE = AgenticMode