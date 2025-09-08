import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
} from "@heroui/drawer";
import { TbMessageCircleUser } from "react-icons/tb";

import { scrollToMessage } from "@/utils/scroll";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  historyMessages: any[];
}

const UserMsgMenu: React.FC<IProps> = ({
  isOpen,
  historyMessages,
  onClose,
}) => {
  const handleClick = (id: number) => {
    scrollToMessage(id);
    onClose();
  };

  return (
    <Drawer
      className="rounded-none w-[260px] p-0"
      isOpen={isOpen}
      placement="right"
      size="xs"
      onOpenChange={onClose}
    >
      <DrawerContent>
        <DrawerHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <TbMessageCircleUser className="w-4.5 h-4.5" />
            Your messages
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-300 font-normal">
            Jump to the message just by one click
          </div>
        </DrawerHeader>
        <DrawerBody className="h-full px-3.5">
          <div className="relative flex h-full w-full flex-1 flex-col gap-2 overflow-y-auto">
            {historyMessages
              .filter((msg) => msg.role === "user")
              .map((msg) => (
                <button
                  key={msg.id}
                  className="flex justify-start text-left text-sm min-h-9 py-1.5 
                  px-2.5 rounded-[10px] hover:bg-gray-200 dark:hover:bg-[#ffffff1a] max-h-20 overflow-y-hidden cursor-pointer"
                  type="button"
                  onClick={() => handleClick(msg.id)}
                >
                  {msg.content}
                </button>
              ))}
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default UserMsgMenu;
