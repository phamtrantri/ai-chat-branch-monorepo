import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { forwardRef } from "react";
import { IoSettingsOutline } from "react-icons/io5";

interface IFunctionButtonProps {
  selectedFunction?: ISelectedFunction;
  setSelectedSetting: (param: any) => void;
}

export interface IFunctionButtonRef {
  onClose: () => void;
}

const SettingButton = forwardRef<IFunctionButtonRef, IFunctionButtonProps>(
  ({ selectedFunction }, ref) => {
    return (
      <Popover showArrow placement="top" shadow="sm">
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
            <div className="px-1 py-2 w-full">
              <p
                className="text-small font-medium text-foreground"
                {...titleProps}
              >
                {`${selectedFunction?.label || "Default chat"} Setting(s)`}
              </p>
              {/* <div className="mt-2 flex flex-col gap-2 w-full">
                <Input
                  defaultValue="100%"
                  label="Width"
                  size="sm"
                  variant="bordered"
                />
              <Input defaultValue="300px" label="Max. width" size="sm" variant="bordered" />
              <Input defaultValue="24px" label="Height" size="sm" variant="bordered" />
              <Input defaultValue="30px" label="Max. height" size="sm" variant="bordered" />
            </div> */}
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  }
);

SettingButton.displayName = "SettingButton";

export default SettingButton;
