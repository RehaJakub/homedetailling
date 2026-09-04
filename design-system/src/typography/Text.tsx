import type { HTMLAttributes, ReactNode } from "react";

export type TextProps = Omit<HTMLAttributes<HTMLParagraphElement>, "children"> & {
  /** `muted` grey body copy, `on-dark` for the dark gallery band, `on-blue` for the blue contact band. */
  tone?: "default" | "muted" | "on-dark" | "on-blue";
  size?: "md" | "sm" | "xs";
  /** Caps the line length at 540px for intro paragraphs. */
  lead?: boolean;
  children: ReactNode;
};

/**
 * Body paragraph with the brand's 1.7 line height.
 */
export function Text({ tone = "default", size = "md", lead = false, className, children, ...rest }: TextProps) {
  const classes = [
    "hd-text",
    tone !== "default" ? `hd-text--${tone}` : "",
    size !== "md" ? `hd-text--${size}` : "",
    lead ? "hd-text--lead" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <p {...rest} className={classes}>
      {children}
    </p>
  );
}
