import type { HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        className?: string;
        "auto-rotate"?: boolean;
        "rotation-per-second"?: string;
        "camera-controls"?: boolean;
        "disable-zoom"?: boolean;
        "shadow-intensity"?: string;
        "shadow-softness"?: string;
        "environment-image"?: string;
        "tone-mapping"?: string;
        autoplay?: boolean;
        "animation-name"?: string;
        exposure?: string;
        "camera-orbit"?: string;
        "field-of-view"?: string;
        "interaction-prompt"?: string;
        loading?: "auto" | "lazy" | "eager";
      };
    }
  }
}

export {};
