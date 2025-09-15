import { Input } from "@heroui/input";
import React, { useEffect, useState } from "react";

import { ETreeOfThoughtsFormFields } from "./constants";

export interface ITreeOfThoughtsSettingsProps {
  initialValues: Record<ETreeOfThoughtsFormFields, string>;
}

const TreeOfThoughtsSettings: React.FC<ITreeOfThoughtsSettingsProps> = ({
  initialValues,
}) => {
  const [models, setModels] =
    useState<Record<ETreeOfThoughtsFormFields, string>>(initialValues);

  useEffect(() => {
    setModels(initialValues);
  }, [initialValues]);

  return (
    <div className="flex flex-col gap-8">
      <Input
        isRequired
        required
        errorMessage="Please enter a valid model"
        label="Reasoner agent model"
        labelPlacement="outside"
        name={ETreeOfThoughtsFormFields.REASONER_AGENT_MODEL}
        placeholder="E.g.: openai/gpt-4o-mini"
        type="text"
        value={models.reasoner_agent_model}
        onValueChange={(value) =>
          setModels({ ...models, reasoner_agent_model: value })
        }
      />
      <Input
        isRequired
        required
        errorMessage="Please enter a valid model"
        label="Evaluator agent model"
        labelPlacement="outside"
        name={ETreeOfThoughtsFormFields.EVALUATOR_AGENT_MODEL}
        placeholder="E.g.: openai/gpt-4o-mini"
        type="text"
        value={models.evaluator_agent_model}
        onValueChange={(value) =>
          setModels({ ...models, evaluator_agent_model: value })
        }
      />
      <Input
        isRequired
        required
        errorMessage="Please enter a valid model"
        label="Executioner agent model"
        labelPlacement="outside"
        name={ETreeOfThoughtsFormFields.EXECUTIONER_AGENT_MODEL}
        placeholder="E.g.: openai/gpt-4o-mini"
        type="text"
        value={models.executioner_agent_model}
        onValueChange={(value) =>
          setModels({ ...models, executioner_agent_model: value })
        }
      />
    </div>
  );
};

export default TreeOfThoughtsSettings;
