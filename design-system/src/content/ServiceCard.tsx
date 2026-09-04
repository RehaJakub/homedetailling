import type { ReactNode } from "react";
import { Icon } from "./Icon";

export type ServiceCardProps = {
  /** Small mono index shown top-right, e.g. "01". */
  number: string;
  title: string;
  text: string;
  /** Icon rendered in brand blue; defaults to the four-point spark. */
  icon?: ReactNode;
};

/**
 * One service in the "Co umíme" grid: index, icon, title and a short description.
 */
export function ServiceCard({ number, title, text, icon }: ServiceCardProps) {
  return (
    <article className="hd-service-card">
      <span className="hd-service-card__number">{number}</span>
      <div className="hd-service-card__icon">{icon ?? <Icon name="sparkle" size={32} stroke={1.5} />}</div>
      <h3 className="hd-service-card__title">{title}</h3>
      <p className="hd-service-card__text">{text}</p>
    </article>
  );
}
