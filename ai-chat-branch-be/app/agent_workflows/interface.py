from abc import ABC, abstractmethod
from typing import List

class AgentWorkflowInterface(ABC):
    @abstractmethod
    async def execute(self, query: List[dict]):
        pass
    @abstractmethod
    async def execute_streamed(self, query: List[dict]):
        pass