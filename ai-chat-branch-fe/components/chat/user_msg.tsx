import { useRouter } from "next/router";
import React from "react";
import { BsReply } from "react-icons/bs";

import { scrollToMessage } from "@/utils/scroll";

const UserMsg: React.FC<{ message: any }> = ({ message }) => {
  const router = useRouter();

  const handleClickOnReferredMessage = async () => {
    await router.replace({
      pathname: router.pathname,
      query: {
        ...router.query,
        focus: message.referred_message_id,
      },
    });
    scrollToMessage(message.referred_message_id);
  };

  return (
    <div
      className="relative flex max-w-full flex-col gap-1 px-2"
      id={message?.id ? `msg-${message.id}` : undefined}
    >
      {!!message.referred_message_content ? (
        <button
          className="text-sm text-gray-500 dark:text-gray-400 flex items-start text-right justify-end gap-1 cursor-pointer"
          type="button"
          onClick={handleClickOnReferredMessage}
        >
          {message.referred_message_content}
          <BsReply className="w-4.5 h-4.5" />
        </button>
      ) : null}
      <div className="min-h-8 relative flex w-full flex-col items-end gap-2 text-start break-words whitespace-normal">
        <div className="relative max-w-3/4 rounded-[18px] bg-gray-200 dark:bg-[#ffffff1a] p-2">
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(UserMsg);
