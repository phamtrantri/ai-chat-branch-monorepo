import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Spinner } from "@heroui/spinner";
import { IoArrowDownOutline } from "react-icons/io5";

import ChatInput from "./chat_input";
import ChatbotMsg from "./chatbot_msg";
import UserMsg from "./user_msg";

import { createConversation, createStreamedMessage } from "@/services";
import { generateUUID } from "@/utils/uuid";
import { EModes, EPromptTechniques, EQuoteType } from "@/constants";
import { scrollToMessage } from "@/utils/scroll";

const Chat: React.FC<{ historyMessages: Array<any> }> = ({
  historyMessages = [],
}) => {
  const router = useRouter();
  const { id, focus: focusMsg, agentic_mode: agenticMode } = router.query || {};

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isCreatedFirstMsgRef = useRef(false);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(
    null
  );
  const [messages, setMessages] = useState<
    { id: string; content: string; role: "user" | "assistant" }[]
  >([]);
  const [streamedText, setStreamedText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteMsg, setQuoteMsg] = useState<any>();
  const [quoteType, setQuoteType] = useState<EQuoteType | undefined>(undefined);
  const [replySubstr, setReplySubstr] = useState<string | undefined>(undefined);

  const [scrollPosition, setScrollPosition] = useState<number>(0);

  const isAtBottom =
    Math.ceil(
      (scrollPosition || 0) +
        (scrollContainerRef.current?.clientHeight || 0) +
        20 // buffer
    ) >= (scrollContainerRef.current?.scrollHeight || 0);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const scrollContainer = scrollContainerRef.current;

    scrollContainer?.scrollTo({
      top: scrollContainer.scrollHeight,
      behavior: behavior,
    });
  };

  const cancelStream = () => {
    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = null;
    }
    setIsSubmitting(false);
    setStreamedText("");
  };

  const submitMessage = async (
    userMsg: string,
    isNewConversation = false,
    agenticMode?: EPromptTechniques | EModes
  ) => {
    if (!userMsg.trim()) {
      return;
    }
    setIsSubmitting(true);
    if (!isNewConversation) {
      setMessages([
        ...messages,
        { id: generateUUID(), content: userMsg, role: "user" },
      ]);
    }

    let fullContent = "";
    let newChatBotMsgId = "";

    try {
      const response = await createStreamedMessage(
        {
          conversationId: Number(id),
          userMsg: userMsg.trim(),
          isNewConversation: isNewConversation,
          agenticMode: agenticMode,
          promptMode: quoteType,
          replyData: quoteType === EQuoteType.REPLY ? {
            referredMessage: quoteMsg,
            subStr: replySubstr ?? "",
          } : undefined
        }
      );

      if (!response.body) {
        throw new Error("ReadableStream not supported in this environment.");
      }

      readerRef.current = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await readerRef.current.read();

        if (value) {
          const res: any = decoder.decode(value, { stream: true });
          const chunks = res.split("\n");
          let content = "";

          for (let chunk of chunks) {
            if (chunk.trim()) {
              const json = JSON.parse(chunk);

              content += json.content;
              newChatBotMsgId = json.message_id;
            }
          }

          fullContent += content;
          setStreamedText(fullContent + "|");
        }
        done = streamDone;
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Stream was cancelled");
      } else {
        console.error("Stream error:", error);
      }
    } finally {
      readerRef.current?.releaseLock();
      readerRef.current = null;
      setIsSubmitting(false);
      setMessages((prev) => [
        ...prev,
        { id: newChatBotMsgId, content: fullContent, role: "assistant" },
      ]);
      setStreamedText("");
    }
  };
  const submitFirstMessage = async () => {
    if (
      historyMessages.length === 1 &&
      historyMessages[0].role === "user" &&
      !isCreatedFirstMsgRef.current
    ) {
      isCreatedFirstMsgRef.current = true;
      submitMessage(
        historyMessages[0].content,
        true,
        agenticMode as EPromptTechniques | EModes
      );
    }
  };

  useLayoutEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.visibility = "hidden";
    }
  }, [id]);

  useEffect(() => {
    setMessages([]);
    submitFirstMessage();
    scrollToBottom("instant");
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.visibility = "visible";
    }
  }, [id]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (quoteMsg) {
      return;
    }
    if (isSubmitting) {
      scrollToBottom();
    }
  }, [messages, isSubmitting]);

  // Cleanup effect to cancel any ongoing streams when component unmounts
  useEffect(() => {
    return () => {
      if (readerRef.current) {
        readerRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      scrollToMessage(focusMsg as string);
    }, 100);
  }, [id, focusMsg]);

  const handleSubmit = async (
    userMsg: string,
    agenticMode?: EPromptTechniques | EModes
  ) => {
    submitMessage(userMsg, false, agenticMode);
  };

  const handleSubmitNewThread = async (userMsg: string, agenticMode?: EPromptTechniques | EModes) => {
    try {
      setIsSubmitting(true);
      const conversation = await createConversation(userMsg, quoteMsg.id);
      const query = agenticMode ? `?agentic_mode=${agenticMode}` : "";


      router.push(`/chat/${conversation.id}${query}`);
      setQuoteMsg(undefined);
      setMessages([]);
      isCreatedFirstMsgRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSubmitReply = async (userMsg: string, agenticMode?: EPromptTechniques | EModes) => {
    submitMessage(userMsg, false, agenticMode);
  };

  const resetInput = () => {
    setQuoteMsg(undefined);
  };

  const startNewQuote = (message: any, quoteType: EQuoteType, substr?: string) => {
    setQuoteMsg(message);
    setQuoteType(quoteType);
    setReplySubstr(substr);
  };

  const onCloseQuote = () => {
    setQuoteMsg(undefined);
    setQuoteType(undefined);
    setReplySubstr(undefined);  
  };

  const finalHandleSubmit = (userMsg: string, agenticMode?: EPromptTechniques | EModes) => {
    if (quoteType === EQuoteType.NEW_THREAD) {
      handleSubmitNewThread(userMsg, agenticMode);
    } else if (quoteType === EQuoteType.REPLY) {
      handleSubmitReply(userMsg, agenticMode);
    } else {
      handleSubmit(userMsg, agenticMode);
    }
  };

  return (
    <div className="dark:bg-[#212121e6] relative flex h-full max-w-full flex-1 flex-col gap-3 px-2 py-4 overflow-hidden shrink-0">
      <div
        ref={scrollContainerRef}
        className="relative flex flex-col h-full w-full overflow-y-auto mb-10"
        style={{ visibility: "hidden" }}
        onScroll={() => {
          setScrollPosition(scrollContainerRef.current?.scrollTop || 0);
        }}
      >
        <div className="relative flex flex-col gap-10 h-full max-w-200 w-full mx-auto">
          {[...historyMessages, ...messages].map((msg) => {
            if (msg.role === "user") {
              return <UserMsg key={msg.id} message={msg} />;
            }

            return (
              <ChatbotMsg
                key={msg.id}
                isHighlighted={Number(focusMsg) === msg.id}
                message={msg}
                resetInput={resetInput}
                startNewQuote={startNewQuote}
              />
            );
          })}
          {isSubmitting ? (
            <div className="flex items-center">
              <ChatbotMsg
                message={{ content: streamedText }}
                resetInput={resetInput}
                startNewQuote={startNewQuote}
              />
              {!streamedText ? (
                <Spinner color="current" size="md" variant="dots" />
              ) : null}
            </div>
          ) : null}
          <div
            className={`invisible h-50`}
            // minus header and chat input
            style={
              isSubmitting ? { minHeight: "calc(100svh - 75px - 225px" } : {}
            }
          >
            placeholder
          </div>
        </div>
      </div>
      <button
        className="bg-white dark:bg-[#212121e6] z-10 border-1 border-gray-300 dark:border-gray-600 flex items-center justify-center h-9 w-9 min-w-9 min-h-9 rounded-full cursor-pointer p-0
            transition-[opacity] duration-200 absolute bottom-25 left-1/2 -translate-x-1/2"
        style={{ opacity: !isAtBottom ? "100" : "0" }}
        type="button"
        onClick={() => scrollToBottom()}
      >
        <IoArrowDownOutline className="w-[20px] h-[20px]" />
      </button>
      <div className="absolute inset-x-0 bottom-5 z-10 flex flex-col items-center justify-center w-full px-2">
        <div className="w-full px-2 max-w-200">
          <ChatInput
            customClassName="w-full"
            handleStop={cancelStream}
            handleSubmit={finalHandleSubmit}
            isSubmitting={isSubmitting}
            quoteMsg={quoteMsg}
            onCloseQuote={onCloseQuote}
            quoteType={quoteType}
            replySubstr={replySubstr}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
