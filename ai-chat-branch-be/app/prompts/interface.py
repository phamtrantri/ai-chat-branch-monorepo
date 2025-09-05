from abc import ABC, abstractmethod

class PromptInterface(ABC):
    @abstractmethod
    def prepare(self, query: str, history=None, extraData=None):
        pass