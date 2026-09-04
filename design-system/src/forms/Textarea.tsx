import type { TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** `light` white admin textarea, `on-blue` translucent one for the blue contact band. */
  tone?: "light" | "on-blue";
};

/**
 * Multi-line text input, vertically resizable.
 */
export function Textarea({ tone = "light", className, ...rest }: TextareaProps) {
  const classes = ["hd-textarea", tone === "on-blue" ? "hd-textarea--on-blue" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return <textarea {...rest} className={classes} />;
}
