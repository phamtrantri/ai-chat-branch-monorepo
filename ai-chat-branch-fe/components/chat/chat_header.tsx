import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import isEmpty from "lodash/isEmpty";
import { useRouter } from "next/router";
import { HiMenuAlt2 } from "react-icons/hi";
import { useState } from "react";
import { TbMessageCircleUser } from "react-icons/tb";

import MobileMenu from "../mobile_menu";

import UserMsgMenu from "./user_msg_menu";

import { formatBreadcrumItem } from "@/utils/formatter";

interface IProps {
  path?: any[];
  conversations: any[];
  historyMessages?: any[];
}

const ChatHeader: React.FC<IProps> = ({
  path,
  conversations,
  historyMessages,
}) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMsgMenuOpen, setIsUserMsgMenuOpen] = useState(false);

  return (
    <div className="h-[75px] dark:bg-[#212121e6] dark:border-[#181818] relative flex w-full flex-row items-center justify-between p-4 border-b-1 border-gray-200">
      <div className="flex flex-col items-start gap-1 sm:gap-0.5 flex-1">
        <div className="flex gap-2 items-center text-base font-medium">
          <HiMenuAlt2
            className="sm:hidden w-4.5 h-4.5"
            onClick={() => setIsMenuOpen(true)}
          />
          ChatGPT Clone
        </div>
        {!isEmpty(path) && path ? (
          <Breadcrumbs size="sm">
            {path.map((elem, idx) => (
              <BreadcrumbItem
                key={elem.id}
                onClick={() => {
                  if (idx < path.length - 1) {
                    router.push(
                      `/chat/${elem.id}?focus=${path?.[idx + 1]?.message_id}`,
                    );
                  }
                }}
              >
                {path.length > 1 ? formatBreadcrumItem(elem.name) : elem.name}
              </BreadcrumbItem>
            ))}
          </Breadcrumbs>
        ) : null}
      </div>
      {!isEmpty(historyMessages) ? (
        <div className="flex justify-end text-xs font-medium">
          <button
            className="flex items-center gap-1 cursor-pointer hover:opacity-70 transition-all duration-200 bg-gray-100 dark:bg-[#323232D9] px-1.5 py-1 rounded-sm font-medium"
            type="button"
            onClick={() => setIsUserMsgMenuOpen(true)}
          >
            <TbMessageCircleUser className="w-4.5 h-4.5" />
            <span className="hidden sm:block">Your messages</span>
          </button>
        </div>
      ) : null}
      <MobileMenu
        conversations={conversations}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
      <UserMsgMenu
        historyMessages={historyMessages || []}
        isOpen={isUserMsgMenuOpen}
        onClose={() => setIsUserMsgMenuOpen(false)}
      />
    </div>
  );
};

export default ChatHeader;
