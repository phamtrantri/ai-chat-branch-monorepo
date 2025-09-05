from app.prompts.interface import PromptInterface
from app.datatype.index import ReplyData

class ReplyPrompt(PromptInterface):
    def __init__(self):
        pass
    
    def prepare(self, query: str, history=None, extraData: ReplyData | None = None):
        if (not history):
            history = []
            
        prompt = (
            f"I am referring to the sub text {extraData.sub_str} of the message {extraData.referred_message["content"]}.\n"
            f"Anwser this query: {query}"
        )
        
        return history + [{"role": "user", "content": prompt}]