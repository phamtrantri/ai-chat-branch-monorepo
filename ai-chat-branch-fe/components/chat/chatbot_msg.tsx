import { useRouter } from "next/router";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { GoPlus } from "react-icons/go";

interface IProps {
  message: any;
  isHighlighted?: boolean;
  startNewThread: (message: any) => void;
  resetInput: () => void;
}

const ChatbotMsg: React.FC<IProps> = ({
  message,
  isHighlighted,
  startNewThread,
  resetInput,
}) => {
  const router = useRouter();
  const stopFocus = () => {
    router.replace(`/chat/${router.query.id}`);
  };

  return (
    <div
      className="relative flex max-w-full flex-col"
      id={message?.id ? `msg-${message.id}` : undefined}
    >
      <div className="min-h-8 relative flex w-full flex-col items-start text-start break-words whitespace-normal">
        <div
          className={`prose dark:prose-invert relative max-w-full p-2 ${isHighlighted ? "border-2 border-amber-500" : ""}`}
        >
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
          >
            {message.content}
          </ReactMarkdown>
        </div>
        {message.content ? (
          <div className="flex flex-row gap-1 text-xs text-gray-500 dark:text-gray-200 px-2">
            <button
              className="flex items-center cursor-pointer hover:opacity-70 transition-all duration-200 bg-gray-100 dark:bg-[#323232D9] px-1 py-0.5 rounded-sm font-medium"
              type="button"
              onClick={() => startNewThread(message)}
            >
              <GoPlus className="w-4 h-4" />
              <span>New thread</span>
            </button>
            {message.child_conversations &&
            message.child_conversations.length > 0 ? (
              <Dropdown className="max-w-[300px]">
                <DropdownTrigger>
                  <button
                    className="cursor-pointer hover:opacity-70 transition-all duration-200 font-normal bg-gray-100 dark:bg-[#323232D9] px-1 py-0.5 rounded-sm"
                    type="button"
                  >
                    Threads
                  </button>
                </DropdownTrigger>
                <DropdownMenu>
                  {(message.child_conversations || []).map((elem: any) => (
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
            {isHighlighted ? (
              <button
                className="flex items-center cursor-pointer hover:opacity-70 transition-all duration-200 bg-gray-100 dark:bg-[#323232D9] px-1 py-0.5 rounded-sm font-medium"
                type="button"
                onClick={stopFocus}
              >
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
