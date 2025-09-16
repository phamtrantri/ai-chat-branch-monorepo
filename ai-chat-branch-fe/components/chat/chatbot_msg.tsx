/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from "react";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { RiDoubleQuotesR, RiChatThreadLine } from "react-icons/ri";
import { Checkbox } from "@heroui/checkbox";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { LuGitBranchPlus } from "react-icons/lu";
import { IoCloseOutline } from "react-icons/io5";
import { Chip } from "@heroui/chip";
import capitalize from "lodash/capitalize";

import ChatbotMsgModel from "./chatbot_msg_model";

import { EQuoteType } from "@/constants";

interface IProps {
  message: IMessage;
  selectedMessagesIds: Set<number>;
  startNewQuote: (
    message: IMessage,
    quoteType: EQuoteType,
    substr?: string
  ) => void;
  resetInput: () => void;
  isThinking?: boolean;
}

const REPLY_POPUP_INIT_STATE = { show: false, x: 0, y: 0, text: "" };

const ChatbotMsg: React.FC<IProps> = ({
  message,
  selectedMessagesIds,
  startNewQuote,
  resetInput,
  isThinking = false,
}) => {
  const router = useRouter();
  const [replyPopup, setReplyPopup] = useState(REPLY_POPUP_INIT_STATE);
  const { id, focus: focusMsg } = router.query || {};

  const isFocused = Number(focusMsg) === message.id;
  const isSelected = selectedMessagesIds.has(message.id);

  const stopFocus = () => {
    router.replace(`/chat/${id}`);
  };

  const handleSelectedText = useCallback((event: React.SyntheticEvent) => {
    if (typeof window === "undefined") {
      return;
    }

    const container = event.currentTarget as HTMLElement;

    requestAnimationFrame(() => {
      const selection = window.getSelection();

      if (!selection || selection.toString().trim().split(" ").length < 3) {
        setReplyPopup(REPLY_POPUP_INIT_STATE);

        return;
      }

      // Store the selection range before state update
      const range = selection.getRangeAt(0).cloneRange();
      const selectionRect = range.getBoundingClientRect();
      const selectedText = selection.toString();

      // Get the container element's position (using stored reference)
      const containerRect = container.getBoundingClientRect();

      // Calculate position relative to container
      const x = selectionRect.left - containerRect.left;
      const y = selectionRect.top - containerRect.top - 40;

      // Update state in next tick to preserve selection
      requestAnimationFrame(() => {
        setReplyPopup({
          show: true,
          x,
          y,
          text: selectedText,
        });
      });
    });
  }, []);

  const handleNoReplySection = useCallback((event: React.MouseEvent) => {
    // Prevent the reply popup from showing when selecting text in reasoning summary
    event.stopPropagation();
  }, []);

  // Close popup when clicking outside the message
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (replyPopup.show) {
        const messageElement = document.getElementById(
          message?.id ? `msg-${message.id}` : ""
        );

        if (messageElement && !messageElement.contains(event.target as Node)) {
          setReplyPopup(REPLY_POPUP_INIT_STATE);
        }
      }
    };

    if (replyPopup.show) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [replyPopup.show, message?.id]);
  const markdownContent = useMemo(
    () => (
      <ReactMarkdown
        components={{
          code(props) {
            const { children, className, ...rest } = props;
            const match = /language-(\w+)/.exec(className || "");

            return match ? (
              <SyntaxHighlighter
                PreTag="div"
                customStyle={{ width: "100%", borderRadius: "8px" }}
                language={match[1]}
                style={vscDarkPlus}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code {...rest} className={className}>
                {children}
              </code>
            );
          },
        }}
        rehypePlugins={[rehypeKatex]}
        remarkPlugins={[remarkMath, remarkGfm]}
      >
        {message.content}
      </ReactMarkdown>
    ),
    [message.content]
  );

  const markdownReasoningSummary = useMemo(() => {
    return (
      <ReactMarkdown
        components={{
          code(props) {
            const { children, className, ...rest } = props;
            const match = /language-(\w+)/.exec(className || "");

            return match ? (
              <SyntaxHighlighter
                PreTag="div"
                customStyle={{ width: "100%", borderRadius: "8px" }}
                language={match[1]}
                style={vscDarkPlus}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code {...rest} className={className}>
                {children}
              </code>
            );
          },
        }}
        rehypePlugins={[rehypeKatex]}
        remarkPlugins={[remarkMath, remarkGfm]}
      >
        {message.reasoning_summary}
      </ReactMarkdown>
    );
  }, [message.reasoning_summary]);

  return (
    <div
      className="relative flex min-w-full flex-col"
      id={message?.id ? `msg-${message.id}` : undefined}
      onMouseUp={handleSelectedText}
    >
      <div className="flex flex-row gap-1" onMouseUp={handleNoReplySection}>
        {message.agentic_mode ? (
          <Chip color="warning" size="sm" variant="flat">
            {capitalize(message.agentic_mode?.split("_").join(" "))}
          </Chip>
        ) : null}
        <ChatbotMsgModel message={message} />
      </div>

      {!!message.reasoning_summary ? (
        <Accordion className="flex min-w-full">
          <AccordionItem
            aria-label={isThinking ? "Thinking" : "Thoughts"}
            className="prose dark:prose-invert text-sm min-w-full"
            classNames={{
              heading: `mb-0 ${isThinking ? "animate-pulse" : ""}`,
              trigger: "cursor-pointer pb-0",
              content: "dark:text-[#f3f3f3] text-gray-700 py-0",
            }}
            title={isThinking ? "Thinking" : "Thoughts"}
          >
            <div onMouseUp={handleNoReplySection}>
              {markdownReasoningSummary}
            </div>
          </AccordionItem>
        </Accordion>
      ) : null}

      {replyPopup.show ? (
        <div
          className="absolute z-50"
          style={{ left: replyPopup.x, top: replyPopup.y }}
        >
          <button
            className="shadow-md flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-base rounded-full bg-gray-100 dark:bg-[#212121] border-1 border-default-200 dark:border-default-300 font-medium cursor-pointer"
            onClick={() =>
              startNewQuote(message, EQuoteType.REPLY, replyPopup.text)
            }
          >
            <RiDoubleQuotesR className="w-4.5 h-4.5" />
            Ask Chatbot
          </button>
        </div>
      ) : null}
      <div
        className="min-h-8 relative flex w-full flex-col items-start text-start break-words whitespace-normal"
        role="group"
      >
        <div
          className={`prose dark:prose-invert relative max-w-full p-2 ${isFocused ? "border-2 border-amber-500" : ""}`}
        >
          {markdownContent}
        </div>
        {message.content ? (
          <div className="flex flex-row gap-1 text-xs text-gray-500 dark:text-gray-200 px-2">
            <button
              className="flex items-center gap-1 cursor-pointer hover:opacity-70 transition-all duration-200 bg-gray-100 dark:bg-[#323232D9] px-1 py-0.5 rounded-sm font-medium"
              type="button"
              onClick={() => startNewQuote(message, EQuoteType.NEW_THREAD)}
            >
              <LuGitBranchPlus className="w-4 h-4" />
              <span>New thread</span>
            </button>
            {message.child_conversations &&
            message.child_conversations.length > 0 ? (
              <Dropdown className="max-w-[300px]">
                <DropdownTrigger>
                  <button
                    className="flex items-center gap-1 cursor-pointer hover:opacity-70 transition-all duration-200 font-normal bg-gray-100 dark:bg-[#323232D9] px-1 py-0.5 rounded-sm"
                    type="button"
                  >
                    <RiChatThreadLine className="w-4 h-4" />
                    Threads
                  </button>
                </DropdownTrigger>
                <DropdownMenu>
                  {(message.child_conversations || []).map((elem) => (
                    <DropdownItem
                      key={elem.id}
                      onClick={() => {
                        router.push(`/chat/${elem.id}`);
                        resetInput();
                      }}
                    >
                      {elem.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            ) : null}
            <button
              className="flex items-center cursor-pointer hover:opacity-70 transition-all duration-200 bg-gray-100 dark:bg-[#323232D9] px-1 py-0.5 rounded-sm font-medium"
              type="button"
              onClick={() => startNewQuote(message, EQuoteType.SELECT)}
            >
              <Checkbox
                isSelected={isSelected}
                radius="sm"
                size="sm"
                onValueChange={() => startNewQuote(message, EQuoteType.SELECT)}
              />
              <span>{isSelected ? "Selected message" : "Select message"}</span>
            </button>
            {isFocused ? (
              <button
                className="flex items-center cursor-pointer hover:opacity-70 transition-all duration-200 bg-gray-100 dark:bg-[#323232D9] px-1 py-0.5 rounded-sm font-medium"
                type="button"
                onClick={stopFocus}
              >
                <IoCloseOutline className="w-4 h-4" />
                Stop focus
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ChatbotMsg;
