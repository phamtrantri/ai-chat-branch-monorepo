interface IChildConversation {
  id: number;
  name: string;
}

interface IMessage {
  id: number;
  content: string;
  reasoning_summary?: string;
  conversation_id: number;
  role: 'user' | 'assistant';
  num_of_children: number;
  created_at: string;
  updated_at: string;
  referred_message_id?: number;
  referred_message_content?: string;
  child_conversations: IChildConversation[];
}