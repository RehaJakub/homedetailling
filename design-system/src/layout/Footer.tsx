import type { ReactNode } from "react";

export type FooterProps = {
  /** Logo image or wordmark; wrapped in a link to `logoHref`. */
  logo: ReactNode;
  logoHref?: string;
  logoLabel?: string;
  /** One-line description, e.g. "Mobilní detailing · Ostrava a okolí". */
  tagline: string;
  /** Copyright or legal line. */
  note: string;
};

/**
 * Three-part page footer: logo, tagline, copyright. Stacks and centers on phones.
 */
export function Footer({ logo, logoHref = "#uvod", logoLabel = "Home Detailing", tagline, note }: FooterProps) {
  return (
    <footer className="hd-footer hd-container">
      <a href={logoHref} className="hd-footer__logo" aria-label={logoLabel}>
        {logo}
      </a>
      <p>{tagline}</p>
      <small>{note}</small>
    </footer>
  );
}
