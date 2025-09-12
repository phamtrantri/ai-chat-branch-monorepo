import { EPromptTechniques, EModes } from "@/constants";

declare global {
  interface ISelectedFunction {
    label: string;
    value: EPromptTechniques | EModes;
    icon: JSX.Element;
  }
  interface IDefaultModelSettings {
    model: string;
  }
}
