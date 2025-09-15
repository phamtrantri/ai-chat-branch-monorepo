import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Chip } from "@heroui/chip";
import isEmpty from "lodash/isEmpty";
import capitalize from "lodash/capitalize";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

const ChatbotMsgModel = ({ message }: { message: IMessage }) => {
  if (!message.model_settings || isEmpty(message.model_settings)) {
    return null;
  }
  if (Object.keys(message.model_settings).length === 1) {
    return (
      <div className="flex flex-row gap-1">
        <Chip color="primary" size="sm" variant="flat">
          {Object.values(message.model_settings)[0]}
        </Chip>
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger>
        <Chip
          classNames={{
            base: "cursor-pointer",
            content: "flex flex-row items-center justify-center gap-0.5",
          }}
          color="primary"
          size="sm"
          variant="flat"
        >
          Multiple models
          <MdOutlineKeyboardArrowRight className="w-4 h-4" />
        </Chip>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2 text-sm">
          {Object.entries(message.model_settings).map(([key, value]) => (
            <div key={key} className="flex flex-row gap-1">
              <label className="text-gray-400">
                {capitalize(key.split("_").join(" "))}:
              </label>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ChatbotMsgModel;
