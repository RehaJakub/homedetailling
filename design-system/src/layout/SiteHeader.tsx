"use client";
import { useState, type ReactNode } from "react";
import { Button } from "../actions/Button";
import { CloseIcon, MenuIcon } from "../internal/icons";

export type SiteHeaderLink = {
  href: string;
  label: string;
};

export type SiteHeaderProps = {
  /** Logo image or wordmark; wrapped in a link to `logoHref`. */
  logo: ReactNode;
  logoHref?: string;
  logoLabel?: string;
  /** Plain navigation links. */
  links: SiteHeaderLink[];
  /** Dark call-to-action button at the end of the navigation. */
  cta?: SiteHeaderLink;
  /** Accessible label for the mobile menu toggle. */
  menuLabel?: string;
};

/**
 * Public site header: logo left, navigation right, collapsing to a toggle menu under 650px.
 */
export function SiteHeader({
  logo,
  logoHref = "#uvod",
  logoLabel = "Home Detailing",
  links,
  cta,
  menuLabel = "Menu",
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="hd-header hd-container">
      <a href={logoHref} className="hd-header__logo" aria-label={logoLabel}>
        {logo}
      </a>

      <button
        type="button"
        className="hd-header__menu"
        aria-label={menuLabel}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      <nav className={open ? "hd-header__nav hd-header__nav--open" : "hd-header__nav"}>
        {links.map((link) => (
          <a key={link.href} href={link.href} className="hd-header__link" onClick={() => setOpen(false)}>
            {link.label}
          </a>
        ))}
        {cta && (
          <Button href={cta.href} variant="dark" nav icon="arrow-up-right" onClick={() => setOpen(false)}>
            {cta.label}
          </Button>
        )}
      </nav>
    </header>
  );
}
