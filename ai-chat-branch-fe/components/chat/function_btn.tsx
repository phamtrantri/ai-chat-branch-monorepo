import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@heroui/dropdown";
import { SharedSelection } from "@heroui/system";
import { forwardRef, useImperativeHandle, useState } from "react";
import { GoPlus } from "react-icons/go";
import { useRouter } from "next/router";

import { modes, promptTechniques } from "@/constants";

interface IFunctionButtonProps {
  setSelectedFunction: (param?: ISelectedFunction) => void;
}

export interface IFunctionButtonRef {
  onClose: () => void;
}

const FunctionButton = forwardRef<IFunctionButtonRef, IFunctionButtonProps>(
  ({ setSelectedFunction: propSetSelectedFunction }, ref) => {
    const router = useRouter();

    const [selectedFunctions, setSelectedFunctions] = useState<SharedSelection>(
      new Set([])
    );

    const handleModelChanged = (keys: SharedSelection) => {
      setSelectedFunctions(keys);
      const values = Array.from(keys);
      const value = values?.[0];

      const foundItem = [...modes, ...promptTechniques].find(
        (elem) => elem.value === value
      );

      propSetSelectedFunction(foundItem);
      router.replace({
        pathname: router.pathname,
        query: { ...router.query, agentic_mode: foundItem?.value },
      });
    };

    useImperativeHandle(ref, () => ({
      onClose: () => {
        setSelectedFunctions(new Set([]));
      },
    }));

    return (
      <Dropdown className="w-full">
        <DropdownTrigger>
          <button
            className="flex items-center justify-center h-9 w-9 min-w-9 min-h-9 rounded-full bg-transparent hover:bg-gray-100 dark:hover:bg-[#ffffff1a] cursor-pointer self-end border-0 p-0"
            type="button"
          >
            <GoPlus className="w-[24px] h-[24px]" />
          </button>
        </DropdownTrigger>
        <DropdownMenu
          disallowEmptySelection
          aria-label="Single selection example"
          selectedKeys={selectedFunctions}
          selectionMode="single"
          variant="flat"
          onSelectionChange={handleModelChanged}
        >
          <DropdownSection showDivider title="Prompt Techniques">
            {promptTechniques.map((elem) => (
              <DropdownItem key={elem.value} startContent={elem.icon}>
                {elem.label}
              </DropdownItem>
            ))}
          </DropdownSection>
          <DropdownSection title="Modes">
            {modes.map((elem) => (
              <DropdownItem key={elem.value} startContent={elem.icon}>
                {elem.label}
              </DropdownItem>
            ))}
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    );
  }
);

FunctionButton.displayName = "FunctionButton";

export default FunctionButton;
