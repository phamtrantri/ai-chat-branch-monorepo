import { useRef, useState, useEffect } from "react";
import { IoArrowUpOutline, IoStop, IoCloseOutline } from "react-icons/io5";
import isEmpty from "lodash/isEmpty";

import FunctionButton, { IFunctionButtonRef } from "./function_btn";

import { EPromptTechniques } from "@/constants";

interface IChatInputProps {
  customClassName?: string;
  isSubmitting: boolean;
  handleSubmit: (userMsg: string) => Promise<void> | void;
  handleStop?: () => void;
  newThreadMsg?: any;
  onCloseThread?: () => void;
}

const promptTemplates = {
  [EPromptTechniques.CHAIN_OF_THOUGHT]:
    "For the below query, I want you to break down your reasoning into smaller steps before reaching the conclusion. Here is the query:\n",
  [EPromptTechniques.TREE_OF_THOUGHT]:
    "For the below query, please generate multiple reasoning paths, explore their possibilities, then select the best final solution. Show your reasoning as a tree of thought. Here is the query:\n",
  [EPromptTechniques.FEW_SHOT]: "Few shot",
};

const ChatInput = ({
  customClassName,
  handleSubmit,
  isSubmitting,
  handleStop,
  newThreadMsg,
  onCloseThread,
}: IChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const functionBtnRef = useRef<IFunctionButtonRef>(null);

  const [userMsg, setUserMsg] = useState("");
  const [isMoreThan1Line, setIsMoreThan1Line] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState<
    { label: string; value: string; icon: JSX.Element } | undefined
  >();

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
      container.style.borderRadius = "28px";
    }
  };

  // Auto-resize when userMsg changes
  useEffect(() => {
    adjustTextareaHeight();
    if (!userMsg) {
      setIsMoreThan1Line(false);
    }
  }, [userMsg, newThreadMsg]);

  const _handleSubmit = () => {
    const template =
      selectedFunction?.value && selectedFunction.value in promptTemplates
        ? promptTemplates[
            selectedFunction.value as keyof typeof promptTemplates
          ]
        : "";

    handleSubmit(template ? `${template}${userMsg}` : userMsg);
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
  const hasThread = !!newThreadMsg;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col w-full border-1 border-default-300 bg-white dark:bg-[#323232] dark:border-[#323232]
        shadow-md transition-[border-radius] duration-150 ease-out ${customClassName}`}
      style={{
        borderRadius: isExpandedInput || hasThread ? "16px" : "28px",
      }}
    >
      {hasThread ? (
        <div className="w-full">
          <div className="dark:bg-[#424242] mx-1 mt-1 rounded-t-[10px] rounded-b-lg bg-gray-100 border-1 border-default-100">
            <div className="flex items-center justify-between text-sm text-[#8f8f8f] font-medium px-1.5 border-b-1 border-default-200 dark:border-default-300">
              <span>Thread starter</span>
              <IoCloseOutline
                className="cursor-pointer w-5 h-5 hover:opacity-70"
                onClick={onCloseThread}
              />
            </div>
            <div className="flex items-start text-sm py-1 px-1.5 gap-1.5 max-h-[75px] overflow-hidden">
              &quot;{newThreadMsg.content}&quot;
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
              setSelectedFunction={setSelectedFunction}
            />
          ) : null}
        </div>
        <div className="flex flex-col w-full">
          {selectedFunction?.value &&
          selectedFunction.value in promptTemplates ? (
            <div className="text-sm italic text-blue-500 dark:text-blue-300">
              {
                promptTemplates[
                  selectedFunction.value as keyof typeof promptTemplates
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
            setSelectedFunction={setSelectedFunction}
          />
          {!isEmpty(selectedFunction) ? (
            <button
              className="flex items-center justify-center py-2 px-1.5 text-sm gap-1 text-blue-500 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-800 rounded-full cursor-pointer"
              type="button"
              onClick={() => {
                functionBtnRef.current?.onClose();
                setSelectedFunction(undefined);
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
