import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "../content/Icon";

export type ButtonVariant =
  | "primary"
  | "dark"
  | "light"
  | "ghost"
  | "danger"
  | "outline-danger";

export type ButtonIcon = "arrow-up-right" | "arrow-down" | "none";

type SharedProps = {
  /** Visual style. `primary` is the blue brand button, `dark` the near-black one, `light` white-on-blue for use on blue surfaces. */
  variant?: ButtonVariant;
  /** `sm` is the compact table-action size. */
  size?: "md" | "sm";
  /** Tighter padding used inside the site header. */
  nav?: boolean;
  /** Stretch to the container width. */
  fullWidth?: boolean;
  /** Trailing icon. Defaults to the diagonal arrow the brand uses on calls to action. */
  icon?: ButtonIcon;
  children: ReactNode;
};

type AnchorProps = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
    /** Renders an `<a>` when set. */
    href: string;
  };

type NativeButtonProps = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    href?: undefined;
  };

export type ButtonProps = AnchorProps | NativeButtonProps;

const icons = {
  "arrow-up-right": <Icon name="arrow-up-right" size={14} stroke={2} />,
  "arrow-down": <Icon name="arrow-down" size={14} stroke={2} />,
  none: null,
};

/**
 * Sharp-cornered brand button with a lift-on-hover motion. Renders a link when `href` is given.
 */
export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    nav = false,
    fullWidth = false,
    icon = "none",
    children,
    className,
    ...rest
  } = props;

  const classes = [
    "hd-button",
    `hd-button--${variant}`,
    size === "sm" ? "hd-button--sm" : "",
    nav ? "hd-button--nav" : "",
    fullWidth ? "hd-button--full" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {children}
      {icons[icon]}
    </>
  );

  if ("href" in rest && typeof rest.href === "string") {
    return (
      <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} className={classes}>
        {content}
      </a>
    );
  }

  const { href: _href, type = "button", ...buttonRest } = rest as NativeButtonProps;
  void _href;
  return (
    <button {...buttonRest} type={type} className={classes}>
      {content}
    </button>
  );
}
