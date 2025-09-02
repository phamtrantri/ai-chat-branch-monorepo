from abc import ABC, abstractmethod

class AgentWorkflowInterface(ABC):
    @abstractmethod
    async def execute(self, query: str, history=None):
        pass
    @abstractmethod
    async def execute_streamed(self, query: str, history=None):
        pass