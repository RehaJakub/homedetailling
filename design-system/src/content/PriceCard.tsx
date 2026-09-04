import { Badge } from "./Badge";
import { Button } from "../actions/Button";
import { CheckIcon } from "../internal/icons";

export type PriceCardProps = {
  /** Package name, e.g. "Interiér". */
  name: string;
  /** Price as displayed ("1 500", "Domluvou"). */
  price: string;
  /** Whether to append the currency after the price. */
  showCurrency?: boolean;
  currency?: string;
  /** Prefix "od " before the price. */
  from?: boolean;
  /** What the package includes. */
  items: string[];
  /** Shows the corner badge. */
  featured?: boolean;
  badgeLabel?: string;
  /** Small label above the name. */
  kicker?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

/**
 * Pricing package card. Hover paints it brand blue; `featured` adds the corner badge.
 */
export function PriceCard({
  name,
  price,
  showCurrency = true,
  currency = "Kč",
  from = false,
  items,
  featured = false,
  badgeLabel = "Nejoblíbenější",
  kicker = "Balíček",
  ctaLabel = "Objednat",
  ctaHref = "#kontakt",
}: PriceCardProps) {
  return (
    <article className="hd-price-card">
      {featured && <Badge corner>{badgeLabel}</Badge>}
      <small className="hd-price-card__kicker">{kicker.toUpperCase()}</small>
      <h3 className="hd-price-card__name">{name}</h3>

      <div className="hd-price-card__price">
        {from && "od "}
        <b>{price}</b>
        {showCurrency && ` ${currency}`}
      </div>

      <ul className="hd-price-card__items">
        {items.map((item) => (
          <li key={item} className="hd-price-card__item">
            <CheckIcon />
            {item}
          </li>
        ))}
      </ul>

      <Button href={ctaHref} variant="dark" fullWidth icon="arrow-up-right" className="hd-price-card__cta">
        {ctaLabel}
      </Button>
    </article>
  );
}
