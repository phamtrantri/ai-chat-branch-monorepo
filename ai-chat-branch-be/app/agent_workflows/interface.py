from abc import ABC, abstractmethod
from typing import List, Dict, Any

class AgentWorkflowInterface(ABC):
    @abstractmethod
    def __init__(self, *args, **kwargs):
        """
        Abstract constructor that must be implemented by subclasses.
        Subclasses should call super().__init__() if they override this.
        """
        pass
    
    @abstractmethod
    async def execute(self, query: List[dict]):
        pass
    
    @abstractmethod
    async def execute_streamed(self, query: List[dict]):
        pass