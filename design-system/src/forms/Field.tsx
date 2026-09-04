import type { LabelHTMLAttributes, ReactNode } from "react";

export type FieldProps = Omit<LabelHTMLAttributes<HTMLLabelElement>, "children"> & {
  /** Label text. */
  label: string;
  /** `stacked` is the larger login-form label; `inline` puts the label beside a checkbox. */
  layout?: "default" | "stacked" | "inline";
  /** The control (`Input`, `Select`, `Textarea`, checkbox). */
  children: ReactNode;
};

/**
 * Label wrapper for a single form control. Uppercase grey label by default.
 */
export function Field({ label, layout = "default", className, children, ...rest }: FieldProps) {
  const classes = ["hd-field", layout !== "default" ? `hd-field--${layout}` : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return (
    <label {...rest} className={classes}>
      {layout === "inline" ? (
        <>
          {children}
          {label}
        </>
      ) : (
        <>
          {label}
          {children}
        </>
      )}
    </label>
  );
}
