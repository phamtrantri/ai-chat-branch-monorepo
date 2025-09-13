from typing import List
import os

def get_model_api_key(model: str):
    modelParts: List[str] = model.split("/")
    prefix = modelParts[0]

    if (prefix == "deepseek"):
        return os.getenv("DEEPSEEK_API_KEY")
    
    if (prefix == "openai"):
        return os.getenv("OPENAI_API_KEY")
    
    return None