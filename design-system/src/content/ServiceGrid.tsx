import type { HTMLAttributes, ReactNode } from "react";

export type ServiceGridProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** `ServiceCard` children. */
  children: ReactNode;
};

/**
 * Three-column ruled grid for `ServiceCard`s; collapses to a single column under 850px.
 */
export function ServiceGrid({ className, children, ...rest }: ServiceGridProps) {
  const classes = ["hd-service-grid", className ?? ""].filter(Boolean).join(" ");
  return (
    <div {...rest} className={classes}>
      {children}
    </div>
  );
}
