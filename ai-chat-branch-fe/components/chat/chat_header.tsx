import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import isEmpty from "lodash/isEmpty";
import { useRouter } from "next/router";
import { HiMenuAlt2 } from "react-icons/hi";
import { useMemo, useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { MdKeyboardArrowDown } from "react-icons/md";
import { SharedSelection } from "@heroui/system";

import MobileMenu from "../mobile_menu";

import { formatBreadcrumItem } from "@/utils/formatter";

interface IProps {
  path?: any[];
  conversations: any[];
}

const ChatHeader: React.FC<IProps> = ({ path, conversations }) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedModels, setSelectedModels] = useState<SharedSelection>(
    new Set(["gpt-5"])
  );

  const selectedValue = useMemo(
    () => Array.from(selectedModels).join(", ").replace(/_/g, ""),
    [selectedModels]
  );

  const handleModelChanged = (keys: SharedSelection) => {
    setSelectedModels(keys);
  };

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
                      `/chat/${elem.id}?focus=${path?.[idx + 1]?.message_id}`
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
      <div className="flex justify-end text-xs font-medium w-[75px]">
        <Dropdown className="w-full">
          <DropdownTrigger>
            <button
              className="flex items-center cursor-pointer hover:opacity-70 transition-all duration-200 bg-gray-100 dark:bg-[#323232D9] px-1.5 py-1 rounded-sm font-medium"
              type="button"
            >
              <span>{selectedValue}</span>
              <MdKeyboardArrowDown className="w-4 h-4" />
            </button>
          </DropdownTrigger>
          <DropdownMenu
            disallowEmptySelection
            aria-label="Single selection example"
            selectedKeys={selectedModels}
            selectionMode="single"
            variant="flat"
            onSelectionChange={handleModelChanged}
          >
            <DropdownItem key="gpt-5">gpt-5</DropdownItem>
            <DropdownItem key="gpt-4">gpt-4</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <MobileMenu
        conversations={conversations}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </div>
  );
};

export default ChatHeader;
