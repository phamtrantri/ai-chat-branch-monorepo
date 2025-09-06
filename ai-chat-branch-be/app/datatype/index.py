from typing import List
from pydantic import BaseModel


class ReplyData(BaseModel):
    referred_message: dict
    sub_str: str

class SelectedMessages(BaseModel):
    selected_messages: List[dict]