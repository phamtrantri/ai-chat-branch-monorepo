import { SVGProps } from "react";

declare global {
  type IconSvgProps = SVGProps<SVGSVGElement> & {
    size?: number;
  };

  // API Response Types
  interface ApiResponse<T> {
    code: number;
    data: T;
  }
}