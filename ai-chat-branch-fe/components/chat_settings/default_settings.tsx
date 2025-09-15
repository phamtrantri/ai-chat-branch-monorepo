import { Input } from "@heroui/input";
import React, { useEffect, useState } from "react";

import { EDefaultFormFields } from "./constants";

export interface IDefaultSettingsProps {
  initialValues: {
    model: string;
  };
}

const DefaultSettings: React.FC<IDefaultSettingsProps> = ({
  initialValues,
}) => {
  const [model, setModel] = useState(initialValues.model || "");

  useEffect(() => {
    setModel(initialValues.model || "");
  }, [initialValues]);

  return (
    <>
      <Input
        isRequired
        required
        errorMessage="Please enter a valid model"
        label="Model"
        labelPlacement="outside"
        name={EDefaultFormFields.MODEL}
        placeholder="E.g.: openai/gpt-4o-mini"
        type="text"
        value={model}
        onValueChange={setModel}
      />
    </>
  );
};

export default DefaultSettings;
