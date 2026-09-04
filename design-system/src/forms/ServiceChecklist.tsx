"use client";
import { Icon } from "../content/Icon";

export type ServiceChoice = {
  id: number | string;
  name: string;
  /** Price as displayed ("1 500", "Domluvou"). */
  price: string;
  showCurrency?: boolean;
  /** Estimated duration in minutes. */
  durationMinutes: number;
};

export type ServiceChecklistProps = {
  options: ServiceChoice[];
  /** Names of the ticked services. */
  values: string[];
  onChange: (values: string[]) => void;
  currency?: string;
  /** `on-blue` (default) for the blue reservation band, `light` for white surfaces. */
  tone?: "on-blue" | "light";
};

function durationText(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h ? `${h} h` : ""}${h && m ? " " : ""}${m ? `${m} min` : ""}`;
}

/**
 * Multi-select list of service packages with price and estimated duration.
 * Each row is a toggle; several services can be ticked for one booking.
 */
export function ServiceChecklist({ options, values, onChange, currency = "Kč", tone = "on-blue" }: ServiceChecklistProps) {
  const toggle = (name: string) => onChange(values.includes(name) ? values.filter((v) => v !== name) : [...values, name]);
  return (
    <div className={tone === "light" ? "hd-checklist hd-checklist--light" : "hd-checklist"} role="group">
      {options.map((option) => {
        const on = values.includes(option.name);
        const price = option.showCurrency === false ? option.price : `${option.price} ${currency}`;
        return (
          <button key={option.id} type="button" role="checkbox" aria-checked={on} className="hd-checklist__row" onClick={() => toggle(option.name)}>
            <span className="hd-checklist__box" aria-hidden="true">
              {on && <Icon name="check" size={14} stroke={2.5} />}
            </span>
            <span className="hd-checklist__name">{option.name}</span>
            <span className="hd-checklist__meta">{durationText(option.durationMinutes)}</span>
            <span className="hd-checklist__price">{price}</span>
          </button>
        );
      })}
    </div>
  );
}
