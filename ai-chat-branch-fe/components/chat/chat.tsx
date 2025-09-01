import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Spinner } from "@heroui/spinner";
import { IoArrowDownOutline } from "react-icons/io5";

import ChatInput from "./chat_input";
import ChatbotMsg from "./chatbot_msg";
import UserMsg from "./user_msg";

import { createConversation, createStreamedMessage } from "@/services";
import { generateUUID } from "@/utils/uuid";

const Chat: React.FC<{ history: Array<any> }> = ({ history = [] }) => {
  const router = useRouter();
  const { id, focus: focusMsg } = router.query || {};

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
  const [newThreadMsg, setNewThreadMsg] = useState<any>();
  const [scrollPosition, setScrollPosition] = useState<number>(0);

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
    is_new_conversation = false
  ) => {
    if (!userMsg.trim()) {
      return;
    }
    setIsSubmitting(true);
    if (!is_new_conversation) {
      setMessages([
        ...messages,
        { id: generateUUID(), content: userMsg, role: "user" },
      ]);
    }

    let fullContent = "";
    let newChatBotMsgId = "";

    try {
      const response = await createStreamedMessage(
        Number(id),
        userMsg.trim(),
        is_new_conversation
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
      history.length === 1 &&
      history[0].role === "user" &&
      !isCreatedFirstMsgRef.current
    ) {
      isCreatedFirstMsgRef.current = true;
      submitMessage(history[0].content, true);
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
    if (newThreadMsg) {
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

  const handleSubmit = async (userMsg: string) => {
    submitMessage(userMsg);
  };

  const scrollToMessage = (
    messageId: string,
    behavior: ScrollBehavior = "smooth"
  ) => {
    if (!messageId) return;
    const el = document.getElementById(`msg-${messageId}`);

    if (el) {
      el.scrollIntoView({ behavior, block: "start" });
    }
  };

  const handleSubmitNewThread = async (userMsg: string) => {
    try {
      setIsSubmitting(true);
      const conversation = await createConversation(userMsg, newThreadMsg.id);

      router.push(`/chat/${conversation.id}`);
      setNewThreadMsg(undefined);
      setMessages([]);
      isCreatedFirstMsgRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetInput = () => {
    setNewThreadMsg(undefined);
  };

  const isAtBottom =
    Math.ceil(
      (scrollPosition || 0) +
        (scrollContainerRef.current?.clientHeight || 0) +
        20 // buffer
    ) >= (scrollContainerRef.current?.scrollHeight || 0);

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
          {[...history, ...messages].map((msg) => {
            if (msg.role === "user") {
              return <UserMsg key={msg.id} message={msg} />;
            }

            return (
              <ChatbotMsg
                key={msg.id}
                isHighlighted={Number(focusMsg) === msg.id}
                message={msg}
                resetInput={resetInput}
                startNewThread={setNewThreadMsg}
              />
            );
          })}
          {isSubmitting ? (
            <div className="flex items-center">
              <ChatbotMsg
                message={{ content: streamedText }}
                resetInput={resetInput}
                startNewThread={setNewThreadMsg}
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
      <div className="absolute inset-x-0 bottom-5 z-10 flex flex-col items-center justify-center w-full px-2 gap-5">
        <button
          className="bg-white dark:bg-[#212121e6] border-1 border-gray-300 dark:border-gray-600 flex items-center justify-center h-9 w-9 min-w-9 min-h-9 rounded-full cursor-pointer p-0
            transition-[opacity] duration-200"
          style={{ opacity: !isAtBottom ? "100" : "0" }}
          type="button"
          onClick={() => scrollToBottom()}
        >
          <IoArrowDownOutline className="w-[20px] h-[20px]" />
        </button>

        <div className="w-full px-2 max-w-200">
          <ChatInput
            customClassName="w-full"
            handleStop={cancelStream}
            handleSubmit={!!newThreadMsg ? handleSubmitNewThread : handleSubmit}
            isSubmitting={isSubmitting}
            newThreadMsg={newThreadMsg}
            onCloseThread={() => {
              setNewThreadMsg(undefined);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
