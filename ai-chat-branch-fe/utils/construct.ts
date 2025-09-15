import isEmpty from "lodash/isEmpty";

import { generateUUIDNumber } from "./uuid";

import { EModes, EPromptTechniques } from "@/constants";

export function constructFEMessage(message: Partial<IMessage>): IMessage {
  return {
    id: generateUUIDNumber(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    child_conversations: [],
    num_of_children: 0,
    role: "assistant",
    conversation_id: 0,
    content: "",
    reasoning_summary: "",
    agentic_mode: undefined,
    model_settings: undefined,
    ...message,
  };
}

export const constructDefaultModelSettings = (
  initialValues: object,
  agenticMode?: EPromptTechniques | EModes
) => {
  if (!isEmpty(initialValues)) {
    return initialValues;
  }
  // get default values if local storage is empty

  if (agenticMode === EModes.DEEP_RESEARCH) {
    return {
      triage_agent_model: "openai/gpt-4o-mini",
      clarifying_agent_model: "openai/gpt-4o-mini",
      research_instruction_agent_model: "openai/gpt-4o-mini",
      research_agent_model: "openai/gpt-4o-mini",
    };
  }
  if (agenticMode === EPromptTechniques.TREE_OF_THOUGHT) {
    return {
      reasoner_agent_model: "openai/gpt-4o-mini",
      evaluator_agent_model: "openai/gpt-4o-mini",
      executioner_agent_model: "openai/gpt-4o-mini",
    };
  }

  if (agenticMode === EModes.THINK_LONGER) {
    return {
      model: "deepseek/deepseek-reasoner",
    };
  }

  return {
    model: "openai/gpt-4o-mini",
  };
};
