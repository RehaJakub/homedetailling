import type { HTMLAttributes, ReactNode } from "react";

export type EyebrowProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Colour treatment: brand blue by default, `on-blue` for the blue contact band, `muted` for grey. */
  tone?: "blue" | "muted" | "on-blue" | "on-dark";
  children: ReactNode;
};

/**
 * Small mono-spaced uppercase label that opens a section ("MOBILNÍ DETAILING · OSTRAVA A OKOLÍ").
 */
export function Eyebrow({ tone = "blue", className, children, ...rest }: EyebrowProps) {
  const classes = ["hd-eyebrow", tone !== "blue" ? `hd-eyebrow--${tone}` : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return (
    <span {...rest} className={classes}>
      {children}
    </span>
  );
}
