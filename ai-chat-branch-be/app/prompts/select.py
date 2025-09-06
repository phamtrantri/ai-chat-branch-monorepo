from app.prompts.interface import PromptInterface
from app.datatype.index import SelectedMessages

class SelectPrompt(PromptInterface):
    def __init__(self):
        pass
    
    def prepare(self, query: str, history=None, extra_data: SelectedMessages | None = None):
        if (not history):
            history = []
            
        prompt = (
            f"I am referring to these messages {extra_data["selected_messages"]}.\n"
            f"Anwser this query based on the referred messages and the given context: {query}"
        )
        
        return history + [{"role": "user", "content": prompt}]