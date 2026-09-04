import type { SelectHTMLAttributes } from "react";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  options: SelectOption[];
  /** `light` white admin select, `on-blue` translucent one for the blue contact band. */
  tone?: "light" | "on-blue";
};

/**
 * Native select styled like the other inputs.
 */
export function Select({ options, tone = "light", className, ...rest }: SelectProps) {
  const classes = ["hd-select", tone === "on-blue" ? "hd-select--on-blue" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return (
    <select {...rest} className={classes}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
