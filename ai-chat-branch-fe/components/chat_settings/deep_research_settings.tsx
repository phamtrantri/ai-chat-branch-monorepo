import { Input } from "@heroui/input";
import React, { useEffect, useState } from "react";

import { EDeepResearchFormFields } from "./constants";

export interface IDeepResearchSettingsProps {
  initialValues: Record<EDeepResearchFormFields, string>;
}

const DeepResearchSettings: React.FC<IDeepResearchSettingsProps> = ({
  initialValues,
}) => {
  const [models, setModels] =
    useState<Record<EDeepResearchFormFields, string>>(initialValues);

  useEffect(() => {
    setModels(initialValues);
  }, [initialValues]);

  return (
    <div className="flex flex-col gap-8">
      <Input
        isRequired
        required
        errorMessage="Please enter a valid model"
        label="Triage agent model"
        labelPlacement="outside"
        name={EDeepResearchFormFields.TRIAGE_AGENT_MODEL}
        placeholder="E.g.: openai/gpt-4o-mini"
        type="text"
        value={models.triage_agent_model}
        onValueChange={(value) =>
          setModels({ ...models, triage_agent_model: value })
        }
      />
      <Input
        isRequired
        required
        errorMessage="Please enter a valid model"
        label="Clarifying agent model"
        labelPlacement="outside"
        name={EDeepResearchFormFields.CLARIFYING_AGENT_MODEL}
        placeholder="E.g.: openai/gpt-4o-mini"
        type="text"
        value={models.clarifying_agent_model}
        onValueChange={(value) =>
          setModels({ ...models, clarifying_agent_model: value })
        }
      />
      <Input
        isRequired
        required
        errorMessage="Please enter a valid model"
        label="Research instruction agent model"
        labelPlacement="outside"
        name={EDeepResearchFormFields.RESEARCH_INSTRUCTION_AGENT_MODEL}
        placeholder="E.g.: openai/gpt-4o-mini"
        type="text"
        value={models.research_instruction_agent_model}
        onValueChange={(value) =>
          setModels({ ...models, research_instruction_agent_model: value })
        }
      />
      <Input
        isRequired
        required
        errorMessage="Please enter a valid model"
        label="Research agent model"
        labelPlacement="outside"
        name={EDeepResearchFormFields.RESEARCH_AGENT_MODEL}
        placeholder="E.g.: openai/gpt-4o-mini"
        type="text"
        value={models.research_agent_model}
        onValueChange={(value) =>
          setModels({ ...models, research_agent_model: value })
        }
      />
    </div>
  );
};

export default DeepResearchSettings;
