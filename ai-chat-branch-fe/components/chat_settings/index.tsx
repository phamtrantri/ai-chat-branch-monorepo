import { useEffect, useState } from "react";
import { isEmpty } from "lodash";

import DefaultSettings, { IDefaultSettingsProps } from "./default_settings";

export enum EPromptTechniques {
  CHAIN_OF_THOUGHT = "cot",
  TREE_OF_THOUGHT = "tot",
}
export enum EModes {
  DEEP_RESEARCH = "deep_research",
  THINK_LONGER = "think_longer",
  SUMMARY = "summary",
}

const getValues = (
  initialValues: object,
  selectedFunction?: ISelectedFunction
) => {
  if (!isEmpty(initialValues)) {
    return initialValues;
  }

  if (selectedFunction?.value === EModes.DEEP_RESEARCH) {
    return {}; // TODO
  }
  if (selectedFunction?.value === EPromptTechniques.TREE_OF_THOUGHT) {
    return {}; // TODO
  }

  return {
    model: "openai/gpt-4o-mini",
  };
};

const ChatSettings: React.FC<{
  selectedFunction?: ISelectedFunction;
}> = ({ selectedFunction }) => {
  const [initialValues, setInitialValues] = useState<object>({});

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const _initialValues = localStorage.getItem(
      selectedFunction?.value || "default"
    );

    setInitialValues(getValues(JSON.parse(_initialValues || "{}")));
  }, [selectedFunction]);

  if (selectedFunction?.value === EModes.DEEP_RESEARCH) {
    return null; // TODO
  }
  if (selectedFunction?.value === EPromptTechniques.TREE_OF_THOUGHT) {
    return null; // TODO
  }

  return (
    <DefaultSettings
      initialValues={initialValues as IDefaultSettingsProps["initialValues"]}
    />
  );
};

export default ChatSettings;
