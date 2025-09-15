import { useEffect, useState } from "react";

import DefaultSettings, { IDefaultSettingsProps } from "./default_settings";
import DeepResearchSettings, {
  IDeepResearchSettingsProps,
} from "./deep_research_settings";
import TreeOfThoughtsSettings, {
  ITreeOfThoughtsSettingsProps,
} from "./tree_of_thoughts";

import { EPromptTechniques, EModes } from "@/constants";
import { constructDefaultModelSettings } from "@/utils/construct";

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

    setInitialValues(
      constructDefaultModelSettings(
        JSON.parse(_initialValues || "{}"),
        selectedFunction?.value
      )
    );
  }, [selectedFunction]);

  if (selectedFunction?.value === EModes.DEEP_RESEARCH) {
    return (
      <DeepResearchSettings
        initialValues={
          initialValues as IDeepResearchSettingsProps["initialValues"]
        }
      />
    );
  }
  if (selectedFunction?.value === EPromptTechniques.TREE_OF_THOUGHT) {
    return (
      <TreeOfThoughtsSettings
        initialValues={
          initialValues as ITreeOfThoughtsSettingsProps["initialValues"]
        }
      />
    );
  }

  return (
    <DefaultSettings
      initialValues={initialValues as IDefaultSettingsProps["initialValues"]}
    />
  );
};

export default ChatSettings;
