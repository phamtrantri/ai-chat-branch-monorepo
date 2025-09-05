import { EModes, EPromptTechniques, EQuoteType } from "@/constants";

// Use different URLs for client-side vs server-side calls
const getApiUrl = () => {
  // Check if we're on the server side
  if (typeof window === 'undefined') {
    // Server-side: use internal URL (Docker service name)
    return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  }
  // Client-side: use public URL
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
};

export const createConversation = async (
  userMsg: string,
  newThreadMsg?: string
) => {
  const res = await fetch(`${getApiUrl()}/conversations/v1/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ first_msg: userMsg, message_id: newThreadMsg }),
  });

  const data = await res.json();

  return data.data.conversation;
};

export const getAllConversations = async () => {
  const res = await fetch(`${getApiUrl()}/conversations/v1/getAll`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();

  return await data.data.conversations;
};

export const getConversationDetails = async (id: number) => {
  const res = await fetch(`${getApiUrl()}/conversations/v1/getDetails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
    }),
  });
  const data = await res.json();

  return data.data;
};

export const createStreamedMessage = async (
  params: {
    conversationId: number;
    userMsg: string;
    isNewConversation?: boolean;
    agenticMode?: EPromptTechniques | EModes;
    promptMode?: EQuoteType;
    replyData?: {
      referredMessage: any;
      subStr: string;
    };
  }
) => {
  const res = await fetch(`${getApiUrl()}/messages/v1/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      conversation_id: params.conversationId,
      user_message: params.userMsg,
      is_new_conversation: params.isNewConversation,
      agentic_mode: params.agenticMode,
      prompt_mode: params.promptMode,
      extra_data: params.replyData ? {
        referred_message: params.replyData.referredMessage,
        sub_str: params.replyData.subStr,
      } : undefined,
    }),
  });

  return res;
};
