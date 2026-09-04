"use client";
import { Badge } from "../content/Badge";

export type TabItem = {
  id: string;
  label: string;
  /** Optional count pill after the label. */
  count?: number;
};

export type TabsProps = {
  items: TabItem[];
  /** Id of the active tab. */
  value: string;
  onChange: (id: string) => void;
  /** Vertical list (admin sidebar) or a horizontal row. */
  orientation?: "vertical" | "horizontal";
  /** Accessible name for the tab list. */
  label?: string;
};

/**
 * Segmented tab list on a grey tray; the active tab fills brand blue.
 */
export function Tabs({ items, value, onChange, orientation = "vertical", label = "Sekce" }: TabsProps) {
  return (
    <nav className={orientation === "horizontal" ? "hd-tabs hd-tabs--horizontal" : "hd-tabs"} aria-label={label}>
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            className={active ? "hd-tabs__tab hd-tabs__tab--active" : "hd-tabs__tab"}
            aria-current={active ? "page" : undefined}
            onClick={() => onChange(item.id)}
          >
            <span className="hd-tabs__dot" aria-hidden="true" />
            {item.label}
            {typeof item.count === "number" && <Badge tone="count">{item.count}</Badge>}
          </button>
        );
      })}
    </nav>
  );
}
