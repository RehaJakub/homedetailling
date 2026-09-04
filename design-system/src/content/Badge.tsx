import type { HTMLAttributes, ReactNode } from "react";

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** `solid` is the blue mono tag, `soft` a light-blue status pill, `count` a grey numeric pill. */
  tone?: "solid" | "soft" | "count";
  /** Pin to the top-right corner of a `position: relative` parent. */
  corner?: boolean;
  children: ReactNode;
};

/**
 * Small tag: the "NEJOBLÍBENĚJŠÍ" corner label, a status pill, or a count.
 */
export function Badge({ tone = "solid", corner = false, className, children, ...rest }: BadgeProps) {
  const classes = [
    "hd-badge",
    tone !== "solid" ? `hd-badge--${tone}` : "",
    corner ? "hd-badge--corner" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span {...rest} className={classes}>
      {children}
    </span>
  );
}
