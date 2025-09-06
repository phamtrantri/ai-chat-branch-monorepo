from enum import Enum

class PromptMode(Enum):
    REPLY = "reply"
    SELECT = "select"
    NEW_THREAD = "new_thread"