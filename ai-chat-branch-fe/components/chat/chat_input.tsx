import { useRef, useState, useEffect, useMemo } from "react";
import {
  IoArrowUpOutline,
  IoStop,
  IoCloseOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";
import isEmpty from "lodash/isEmpty";
import { useRouter } from "next/router";

import FunctionButton, { IFunctionButtonRef } from "./function_btn";

import {
  EModes,
  EPromptTechniques,
  EQuoteType,
  modes,
  promptTechniques,
} from "@/constants";
import { scrollToMessage } from "@/utils/scroll";

interface IChatInputProps {
  customClassName?: string;
  isSubmitting: boolean;
  handleSubmit: (
    userMsg: string,
    agenticMode?: EPromptTechniques | EModes
  ) => Promise<void> | void;
  handleStop?: () => void;
  quoteMsg?: IMessage;
  onCloseQuote?: () => void;
  quoteType?: EQuoteType;
  replySubstr?: string;
  selectedMessageIds?: Set<number>;
}

interface ISelectedFunction {
  label: string;
  value: string;
  icon: JSX.Element;
}

const promptIntroductions = {
  [EPromptTechniques.CHAIN_OF_THOUGHT]:
    "Solve the problem by reasoning step by step.",
  [EPromptTechniques.TREE_OF_THOUGHT]:
    "Generate multiple reasoning paths, then select the best final solution. To produce best result, ToT will not take in the chat history.",
};

const ChatInput = ({
  customClassName,
  handleSubmit,
  isSubmitting,
  handleStop,
  quoteMsg,
  onCloseQuote,
  quoteType,
  replySubstr,
  selectedMessageIds,
}: IChatInputProps) => {
  const router = useRouter();
  const { agentic_mode: agenticMode, id } = router.query || {};

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const functionBtnRef = useRef<IFunctionButtonRef>(null);

  const [userMsg, setUserMsg] = useState("");
  const [isMoreThan1Line, setIsMoreThan1Line] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState<
    ISelectedFunction | undefined
  >(() => {
    return [...promptTechniques, ...modes].find(
      (elem) => elem.value === agenticMode
    );
  });

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;

    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";

      if (textarea.scrollHeight >= 200) {
        textarea.style.overflowY = "auto";
      }

      // Set height to scrollHeight to fit content
      const newHeight = Math.min(textarea.scrollHeight, 200);

      // Check the case if user type a long text to break line
      textarea.style.height =
        newHeight === 48 &&
        !isMoreThan1Line &&
        !userMsg.includes("\n") &&
        !userMsg.includes("\r")
          ? `24px`
          : `${newHeight}px`;

      const lines = Math.ceil(newHeight / 24); // Approximate line height

      if (!isMoreThan1Line) {
        setIsMoreThan1Line(lines > 1);
      }
    }
  };

  const resetTextareaHeight = () => {
    const textarea = textareaRef.current;
    const container = containerRef.current;

    if (textarea && container) {
      textarea.style.height = "24px";
      if (!agenticMode) {
        container.style.borderRadius = "28px";
      }
    }
  };

  // Auto-resize when userMsg changes
  useEffect(() => {
    adjustTextareaHeight();
    if (!userMsg) {
      setIsMoreThan1Line(false);
    }
  }, [userMsg, quoteMsg]);

  useEffect(() => {
    setUserMsg("");
    onCloseQuote?.();
    if (!agenticMode) {
      handleSelectedFunction(undefined);
    }
  }, [id]);

  const _handleSubmit = () => {
    handleSubmit(
      userMsg,
      selectedFunction?.value as EPromptTechniques | EModes
    );
    setUserMsg("");
    resetTextareaHeight();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      _handleSubmit();
    }
  };

  const isExpandedInput = isMoreThan1Line || !isEmpty(selectedFunction);
  const hasQuote = !!quoteMsg;
  const quoteHeader = useMemo(() => {
    if (quoteType === EQuoteType.NEW_THREAD) {
      return "Thread starter";
    } else if (quoteType === EQuoteType.REPLY) {
      return "Reply to";
    } else if (quoteType === EQuoteType.SELECT) {
      return `Selected message(s): ${selectedMessageIds?.size}`;
    }

    return null;
  }, [quoteType, selectedMessageIds?.size]);
  const quoteContent = useMemo(() => {
    if (quoteType === EQuoteType.REPLY) {
      return `"${replySubstr}"`;
    }
    if (quoteType === EQuoteType.SELECT) {
      const listMsgs = Array.from(selectedMessageIds || new Set([])).sort(
        (a, b) => a - b
      );
      const displayedList = listMsgs.map((elem, idx) => (
        <button
          key={elem}
          className="cursor-pointer text-blue-500 dark:text-blue-300 hover:opacity-70"
          onClick={() => scrollToMessage(elem)}
        >
          #{idx + 1}
          {idx < listMsgs.length - 1 ? "," : ""}
        </button>
      ));

      return displayedList;
    }

    return `"${quoteMsg?.content}"`;
  }, [quoteType, replySubstr, quoteMsg, selectedMessageIds]);

  const handleSelectedFunction = (selectedFn?: ISelectedFunction) => {
    if (selectedFn?.value === EModes.SUMMARY) {
      const summaryText = "Summarize messages for me";

      setUserMsg((prev) => (prev ? prev + "\n" + summaryText : summaryText));
    }

    setSelectedFunction(selectedFn);
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col w-full border-1 border-default-300 bg-white dark:bg-[#323232] dark:border-[#323232]
        shadow-md transition-[border-radius] duration-150 ease-out ${customClassName}`}
      style={{
        borderRadius: isExpandedInput || hasQuote ? "16px" : "28px",
      }}
    >
      {hasQuote ? (
        <div className="w-full">
          <div className="dark:bg-[#424242] mx-1 mt-1 rounded-t-[10px] rounded-b-lg bg-gray-100 border-1 border-default-100">
            <div className="flex items-center justify-between text-sm text-[#8f8f8f] font-medium px-1.5 border-b-1 border-default-200 dark:border-default-300">
              <span>{quoteHeader}</span>
              <IoCloseOutline
                className="cursor-pointer w-5 h-5 hover:opacity-70"
                onClick={onCloseQuote}
              />
            </div>
            <div className="flex items-start text-sm py-1 px-1.5 gap-1.5 max-h-[75px] overflow-hidden">
              {quoteContent}
            </div>
          </div>
        </div>
      ) : null}
      <div
        className={`flex flex-row w-full justify-center items-center p-2.5 gap-1 relative ${isExpandedInput && "px-4.5"}`}
      >
        <div
          className={`transition-all duration-300 ease-in-out flex-shrink-0 ${
            isExpandedInput ? "w-0 opacity-0" : "w-9 opacity-100"
          }`}
        >
          {!isExpandedInput ? (
            <FunctionButton
              ref={functionBtnRef}
              setSelectedFunction={handleSelectedFunction}
            />
          ) : null}
        </div>
        <div className="flex flex-col w-full">
          {selectedFunction?.value &&
          selectedFunction.value in promptIntroductions ? (
            <div className="flex gap-1 text-sm italic text-blue-500 dark:text-blue-300">
              <IoInformationCircleOutline className="min-w-4 min-h-4 w-4 h-4 mt-0.5" />
              {
                promptIntroductions[
                  selectedFunction.value as keyof typeof promptIntroductions
                ]
              }
            </div>
          ) : null}
          <textarea
            ref={textareaRef}
            className="w-full focus:outline-none resize-none min-h-[24px] max-h-[200px] overflow-y-auto bg-transparent text-base transition-all duration-300 ease-in-out"
            name="chat input"
            placeholder="Ask anything. Shift + Enter to Submit"
            rows={1}
            style={{
              transition: "height 0.15s ease-out",
              overflowY: "hidden",
            }}
            value={userMsg}
            onChange={(e) => setUserMsg(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          className={`flex items-center justify-center h-9 w-9 min-w-9 min-h-9 rounded-full bg-black cursor-pointer self-end border-0 p-0 ${isExpandedInput ? "hidden" : "block"}`}
          type="button"
          onClick={isSubmitting ? handleStop : _handleSubmit}
        >
          {isSubmitting ? (
            <IoStop className="text-white w-[20px] h-[20px] animate-pulse" />
          ) : (
            <IoArrowUpOutline className="text-white w-[20px] h-[20px]" />
          )}
        </button>
      </div>
      {isExpandedInput ? (
        <div className="flex flex-1 items-center p-2.5">
          <FunctionButton
            ref={functionBtnRef}
            setSelectedFunction={handleSelectedFunction}
          />
          {!isEmpty(selectedFunction) ? (
            <button
              className="flex items-center justify-center py-2 px-1.5 text-sm gap-1 text-blue-500 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-800 rounded-full cursor-pointer"
              type="button"
              onClick={() => {
                functionBtnRef.current?.onClose();
                handleSelectedFunction(undefined);
                const query = { ...router.query };

                delete query.agentic_mode;
                router.replace({
                  pathname: router.pathname,
                  query,
                });
              }}
            >
              {selectedFunction.icon}
              {selectedFunction?.label}
              <IoCloseOutline className="w-4 h-4" />
            </button>
          ) : null}

          <button
            className="flex items-center justify-center h-9 w-9 min-w-9 min-h-9 rounded-full bg-black cursor-pointer self-end border-0 p-0 ml-auto"
            type="button"
            onClick={isSubmitting ? handleStop : _handleSubmit}
          >
            {isSubmitting ? (
              <IoStop className="text-white w-[20px] h-[20px] animate-pulse" />
            ) : (
              <IoArrowUpOutline className="text-white w-[20px] h-[20px]" />
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ChatInput;
