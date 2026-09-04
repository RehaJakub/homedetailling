import type { HTMLAttributes, ReactNode } from "react";

export type NoticeProps = Omit<HTMLAttributes<HTMLParagraphElement>, "children"> & {
  /** `error` is the pink admin error box, `info` a light-blue box, `on-blue` a bare pale-red line for the blue contact band. */
  tone?: "error" | "info" | "on-blue";
  children: ReactNode;
};

/**
 * Inline status message for forms and panels.
 */
export function Notice({ tone = "error", className, children, ...rest }: NoticeProps) {
  const classes = ["hd-notice", `hd-notice--${tone}`, className ?? ""].filter(Boolean).join(" ");
  return (
    <p {...rest} role={tone === "error" || tone === "on-blue" ? "alert" : undefined} className={classes}>
      {children}
    </p>
  );
}
