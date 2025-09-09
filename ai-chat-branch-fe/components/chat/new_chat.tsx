import { useRouter } from "next/router";
import { useState } from "react";

import ChatInput from "./chat_input";

import { createConversation } from "@/services";
import { EModes, EPromptTechniques } from "@/constants";

const NewChat = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (
    userMsg: string,
    agenticMode?: EPromptTechniques | EModes
  ) => {
    try {
      setIsSubmitting(true);
      const conversation = await createConversation(userMsg);

      const query = agenticMode ? `?agentic_mode=${agenticMode}` : "";

      router.push(`/chat/${conversation.id}${query}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dark:bg-[#212121e6] relative flex h-full max-w-full flex-1 flex-col items-center justify-center gap-3 px-2">
      <h1 className="text-[28px] leading-[34px] font-normal tracking-[0.38px]">
        A chat-gpt clone
      </h1>
      <div className="max-w-md text-center text-base leading-[24px] font-normal tracking-[-0.32px] text-balance mb-5 text-[#5d5d5d] dark:text-gray-300">
        A fun project that supports branching conversations
      </div>
      <ChatInput
        customClassName="sm:max-w-1/2"
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default NewChat;
