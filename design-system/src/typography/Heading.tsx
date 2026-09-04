import { createElement, type HTMLAttributes, type ReactNode } from "react";

export type HeadingSize = "display" | "section" | "panel" | "dialog" | "card" | "title";

export type HeadingProps = Omit<HTMLAttributes<HTMLHeadingElement>, "children"> & {
  /** Semantic level; rendered as `h1`–`h4`. */
  level?: 1 | 2 | 3 | 4;
  /** Visual scale. `display` is the hero headline, `section` a landing-page section, `panel` an admin page title, `card` a price-card name. */
  size?: HeadingSize;
  /** Use `<em>` inside for the blue accent word. */
  children: ReactNode;
};

/**
 * Tight, heavy headline. Wrap a word in `<em>` to paint it brand blue.
 */
export function Heading({ level = 2, size = "section", className, children, ...rest }: HeadingProps) {
  const classes = ["hd-heading", `hd-heading--${size}`, className ?? ""].filter(Boolean).join(" ");
  return createElement(`h${level}`, { ...rest, className: classes }, children);
}
