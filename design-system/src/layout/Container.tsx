import type { HTMLAttributes, ReactNode } from "react";

export type ContainerProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Element to render; `section` for page sections, `div` by default. */
  as?: "div" | "section" | "header" | "footer";
  children: ReactNode;
};

/**
 * Centered page column, 1180px wide with 20px side gutters (15px on phones).
 */
export function Container({ as: Tag = "div", className, children, ...rest }: ContainerProps) {
  const classes = ["hd-container", className ?? ""].filter(Boolean).join(" ");
  return (
    <Tag {...rest} className={classes}>
      {children}
    </Tag>
  );
}
