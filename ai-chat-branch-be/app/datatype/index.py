from pydantic import BaseModel


class ReplyData(BaseModel):
    referred_message: dict
    sub_str: str