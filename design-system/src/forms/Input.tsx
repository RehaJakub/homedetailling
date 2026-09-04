import type { InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** `light` white admin input, `on-blue` translucent input for the blue contact band. */
  tone?: "light" | "on-blue";
};

/**
 * Text input. Checkboxes get the compact brand-blue accent automatically.
 */
export function Input({ tone = "light", className, type = "text", ...rest }: InputProps) {
  if (type === "checkbox") {
    return <input {...rest} type="checkbox" className={["hd-checkbox", className ?? ""].filter(Boolean).join(" ")} />;
  }
  const classes = ["hd-input", tone === "on-blue" ? "hd-input--on-blue" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return <input {...rest} type={type} className={classes} />;
}
