from app.prompts.interface import PromptInterface

class DefaultPrompt(PromptInterface):
    def prepare(self, query: str, history=None, extraData=None):
        if (not history):
            history = []
            
        return history + [{"role": "user", "content": query}]