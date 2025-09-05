import { IoBookOutline } from "react-icons/io5";
import { FaRegLightbulb } from "react-icons/fa";
import { GiBreakingChain } from "react-icons/gi";
import { GiTreeBranch } from "react-icons/gi";


export enum QuoteType {
  NEW_THREAD = "new_thread",
  REPLY = "reply",
  SUMMARY = "summary",
}


export enum EPromptTechniques {
  CHAIN_OF_THOUGHT = "cot",
  TREE_OF_THOUGHT = "tot",
}
export enum EModes {
  DEEP_RESEARCH = "deep_research",
  THINK_LONGER = "think_longer",
  SUMMARY = "summary",
}
export enum EModels {}

export const promptTechniques = [
  {
    value: EPromptTechniques.CHAIN_OF_THOUGHT,
    label: "Chain-of-Thought",
    icon: <GiBreakingChain className="w-4.5 h-4.5" />,
  },
  {
    value: EPromptTechniques.TREE_OF_THOUGHT,
    label: "Tree of thoughts",
    icon: <GiTreeBranch className="w-4.5 h-4.5" />,
  },
];

export const modes = [
  {
    value: EModes.THINK_LONGER,
    label: "Think longer",
    icon: <FaRegLightbulb className="w-4.5 h-4.5" />,
  },
  {
    value: EModes.DEEP_RESEARCH,
    label: "Deep research",
    icon: <IoBookOutline className="w-4.5 h-4.5" />,
  },
];

export const models = [];
