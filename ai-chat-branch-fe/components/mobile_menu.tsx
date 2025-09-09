import { Drawer, DrawerContent } from "@heroui/drawer";

import Menu from "./menu";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: IConversation[];
}

const MobileMenu: React.FC<IProps> = ({ isOpen, conversations, onClose }) => {
  return (
    <Drawer
      className="rounded-none w-[260px]"
      isOpen={isOpen}
      placement="left"
      size="xs"
      onOpenChange={onClose}
    >
      <DrawerContent>
        <Menu
          isMobile
          conversations={conversations}
          onCloseOnMobile={onClose}
        />
      </DrawerContent>
    </Drawer>
  );
};

export default MobileMenu;
