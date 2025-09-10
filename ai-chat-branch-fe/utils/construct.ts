import { generateUUIDNumber } from "./uuid";

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
    ...message,
  };
}
