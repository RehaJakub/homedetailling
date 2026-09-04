"use client";
import { useState } from "react";
import { Icon } from "../content/Icon";

export type ServiceOption = {
  id: number | string;
  name: string;
  /** Price as displayed ("1 500", "Domluvou"). */
  price: string;
  showCurrency?: boolean;
};

export type ServiceDropdownProps = {
  options: ServiceOption[];
  /** Selected option name. */
  value: string;
  onChange: (name: string) => void;
  placeholder?: string;
  /** Name of the hidden input that carries the value in a form submit. */
  name?: string;
  currency?: string;
  /** `on-blue` (default) for the contact band, `light` for white surfaces. */
  tone?: "on-blue" | "light";
  /** Start with the menu open (useful for previews). */
  defaultOpen?: boolean;
};

/**
 * Custom select listing service packages with their price. Writes the choice to a hidden input.
 */
export function ServiceDropdown({
  options,
  value,
  onChange,
  placeholder = "Vyberte službu",
  name = "service",
  currency = "Kč",
  tone = "on-blue",
  defaultOpen = false,
}: ServiceDropdownProps) {
  const [open, setOpen] = useState(defaultOpen);
  const selected = options.find((option) => option.name === value);
  const priceOf = (option: ServiceOption) => `${option.price}${option.showCurrency === false ? "" : ` ${currency}`}`;

  return (
    <div className={tone === "light" ? "hd-dropdown hd-dropdown--light" : "hd-dropdown"}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        className="hd-dropdown__trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((state) => !state)}
      >
        <span className="hd-dropdown__value">
          {selected ? selected.name : placeholder}
          {selected && <small className="hd-dropdown__hint">{priceOf(selected)}</small>}
        </span>
        <span className="hd-dropdown__chevron">
          <Icon name="chevron-down" size={18} stroke={2} />
        </span>
      </button>

      {open && (
        <div className="hd-dropdown__menu" role="listbox">
          {options.map((option) => (
            <button
              type="button"
              role="option"
              aria-selected={option.name === value}
              className="hd-dropdown__option"
              key={option.id}
              onClick={() => {
                onChange(option.name);
                setOpen(false);
              }}
            >
              <span>{option.name}</span>
              <strong className="hd-dropdown__price">{priceOf(option)}</strong>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
