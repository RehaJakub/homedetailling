import type { FormHTMLAttributes, HTMLAttributes, ReactNode } from "react";

type CardVariant = "default" | "dashed" | "panel";

type SharedProps = {
  /** `dashed` marks an "add new" card, `panel` is the large elevated admin panel. */
  variant?: CardVariant;
  /** Optional heading rendered at the top of the card. */
  title?: string;
  children: ReactNode;
};

type DivCardProps = SharedProps &
  Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> & { as?: "div" | "section" };

type FormCardProps = SharedProps &
  Omit<FormHTMLAttributes<HTMLFormElement>, "children" | "title"> & { as: "form" };

export type CardProps = DivCardProps | FormCardProps;

/**
 * Bordered white surface used for admin forms and panels. Can render as a `<form>`.
 */
export function Card(props: CardProps) {
  const { variant = "default", title, className, children, as = "div", ...rest } = props;
  const classes = ["hd-card", variant !== "default" ? `hd-card--${variant}` : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  const body = (
    <>
      {title && <h3 className="hd-card__title">{title}</h3>}
      {children}
    </>
  );

  if (as === "form") {
    return (
      <form {...(rest as FormHTMLAttributes<HTMLFormElement>)} className={classes}>
        {body}
      </form>
    );
  }
  if (as === "section") {
    return (
      <section {...(rest as HTMLAttributes<HTMLElement>)} className={classes}>
        {body}
      </section>
    );
  }
  return (
    <div {...(rest as HTMLAttributes<HTMLDivElement>)} className={classes}>
      {body}
    </div>
  );
}
