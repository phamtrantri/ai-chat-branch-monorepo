from app.prompts.interface import PromptInterface
from app.prompts.constants import PromptMode
from app.prompts.reply import ReplyPrompt
# from app.prompts.summary import SummaryPrompt
from app.prompts.default import DefaultPrompt


class Context:
  _prompt_strategy: PromptInterface

  def set_prompt_strategy(self, strategy: PromptInterface):
    self._prompt_strategy = strategy

  def prepare(self, query: str, history, extra_data = None):
    return self._prompt_strategy.prepare(query, history, extra_data)

class Prompt:
    context: Context

    def __init__(self):
        self.context = Context()

    def set_prompt_strategy(self, mode: PromptMode | None = None):
        if (mode == PromptMode.REPLY):
            self.context.set_prompt_strategy(ReplyPrompt())
        elif (mode == PromptMode.SUMMARY):
            # self.context.set_prompt_strategy(SummaryPrompt())
            pass
        else:
            self.context.set_prompt_strategy(DefaultPrompt())

    def prepare(self, query: str, history, mode: PromptMode | None = None, extra_data = None):
        self.set_prompt_strategy(mode)

        return self.context.prepare(query, history, extra_data)