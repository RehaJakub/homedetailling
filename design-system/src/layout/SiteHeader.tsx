"use client";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "../actions/Button";
import { Icon } from "../content/Icon";

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
  /** Keep the header pinned to the top while scrolling (white bar with a hairline once scrolled). */
  sticky?: boolean;
  /** `href` of the link that matches the section currently in view. */
  activeHref?: string;
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
  sticky = false,
  activeHref,
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!sticky) return;
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sticky]);

  const header = (
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
        {open ? <Icon name="close" size={26} /> : <Icon name="menu" size={26} />}
      </button>

      <nav className={open ? "hd-header__nav hd-header__nav--open" : "hd-header__nav"}>
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={link.href === activeHref ? "hd-header__link hd-header__link--active" : "hd-header__link"}
            aria-current={link.href === activeHref ? "true" : undefined}
            onClick={() => setOpen(false)}
          >
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

  if (!sticky) return header;
  return <div className={scrolled ? "hd-header-bar hd-header-bar--scrolled" : "hd-header-bar"}>{header}</div>;
}
