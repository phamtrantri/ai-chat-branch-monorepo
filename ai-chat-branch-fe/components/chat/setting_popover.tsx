import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { FormEvent, forwardRef, useState } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import { Form } from "@heroui/form";
import { Button } from "@heroui/button";

import ChatSettings from "../chat_settings";

interface IFunctionButtonProps {
  selectedFunction?: ISelectedFunction;
}

export interface IFunctionButtonRef {
  onClose: () => void;
}

const SettingPopover = forwardRef<IFunctionButtonRef, IFunctionButtonProps>(
  ({ selectedFunction }, _) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const localStorageKey = selectedFunction?.value || "default";

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(e.currentTarget));

      if (typeof window === "undefined") {
        return;
      }

      localStorage.setItem(localStorageKey, JSON.stringify(data));
      setIsPopoverOpen(false);
    };

    return (
      <Popover
        showArrow
        isOpen={isPopoverOpen}
        placement="top"
        shadow="sm"
        onOpenChange={setIsPopoverOpen}
      >
        <PopoverTrigger>
          <button
            className="flex items-center justify-center h-9 w-9 min-w-9 min-h-9 rounded-full bg-transparent hover:bg-gray-100 dark:hover:bg-[#ffffff1a] cursor-pointer self-end border-0 p-0 ml-auto"
            type="button"
          >
            <IoSettingsOutline className="w-[20px] h-[20px]" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px]">
          {(titleProps) => (
            <div className="px-1 py-2 w-full flex flex-col gap-2">
              <p
                className="text-small font-medium text-foreground"
                {...titleProps}
              >
                {`${selectedFunction?.label || "Default chat"} Setting(s)`}
              </p>
              <hr className="border-gray-300 dark:border-gray-700" />
              <Form
                className="w-full flex flex-col gap-6 pt-2"
                onSubmit={handleSubmit}
              >
                <ChatSettings selectedFunction={selectedFunction} />
                <Button
                  className="self-end"
                  color="primary"
                  size="sm"
                  type="submit"
                >
                  Save
                </Button>
              </Form>
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  }
);

SettingPopover.displayName = "SettingButton";

export default SettingPopover;
