interface IConversation {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  message_id: number;
}

interface IConversationPath {
  id: number;
  name: string;
  message_id: number;
}

interface ConversationsRes {
  conversations: IConversation[];
}

interface ConversationCreateRes {
  conversation: IConversation;
}

interface ConversationDetailsRes {
  messages: IMessage[];
  path: IConversationPath[];
}