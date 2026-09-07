"use client";
import { useEffect, useRef, useState } from "react";
import { Button, Field, Heading, Icon, Input, Notice, Textarea, Select } from "@homedetailing/ui";
import { conflictsOf, dayLabel, durationLabel, initials, isActive, priceLabel, slotLabel, STATUS_LABEL, type BookingStatus } from "@/lib/booking";
import styles from "@/app/admin/admin.module.css";
import { selectServices } from "@/lib/service-selection";
import type { Booking, Customer, Draft, Package, Settings } from "./types";

const mono = "var(--hd-font-mono)";
const MINI_H = 440;

export type OrderModalProps = {
  draft: Draft;
  orig: string | null;
  bookings: Booking[];
  packages: Package[];
  settings: Settings;
  customers: Customer[];
  canEdit: boolean;
  onChange: (patch: Partial<Draft>) => void;
  onClose: () => void;
  onSave: (status?: BookingStatus) => void;
  onDelete: () => void;
  onToast: (title: string, text?: string, tone?: "ok" | "warn" | "danger", icon?: "sparkle" | "alert") => void;
};

/** Order editor: client, time with conflict check and quick shifts, service cards, status chips, day mini-timeline. */
export function OrderModal({ draft: d, orig, bookings, packages, settings, customers, canEdit, onChange, onClose, onSave, onDelete, onToast }: OrderModalProps) {
  const { openSlot: open, closeSlot: close } = settings;
  const rows = close - open;
  const conflicts = conflictsOf({ id: d.id, date: d.date, slotStart: d.a, slotEnd: d.b, status: d.status }, bookings);
  const others = bookings.filter((r) => r.date === d.date && r.id !== d.id && r.status !== "cancelled");
  const exists = d.id !== null;
  const dirty = orig !== null && orig !== JSON.stringify(d);
  const avatarBg = d.status === "confirmed" ? "#1769ff" : d.status === "done" ? "#e1e5eb" : "#dce8ff";
  const avatarFg = d.status === "confirmed" ? "#fff" : d.status === "done" ? "#687080" : "#1769ff";
  const timeOptions = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => ({ value: String(from + i), label: slotLabel(from + i) }));
  const shift = (n: number) => onChange({ a: Math.max(open, d.a + n), b: Math.min(close, d.b + n) });
  const H = MINI_H / rows;

  // Drag the blue block in the mini-timeline: body moves it (length kept),
  // the bottom edge resizes it. Snaps to 15-minute rows.
  const [drag, setDrag] = useState<{ mode: "move" | "resize"; startY: number; a: number; b: number } | null>(null);
  const dragRef = useRef(drag);
  useEffect(() => {
    dragRef.current = drag;
  }, [drag]);
  useEffect(() => {
    if (!drag) return;
    const onMove = (ev: PointerEvent) => {
      const g = dragRef.current;
      if (!g) return;
      const delta = Math.round((ev.clientY - g.startY) / H);
      if (g.mode === "move") {
        const length = g.b - g.a;
        const a = Math.min(close - length, Math.max(open, g.a + delta));
        onChange({ a, b: a + length });
      } else {
        onChange({ b: Math.min(close, Math.max(g.a + 1, g.b + delta)) });
      }
    };
    const stop = () => setDrag(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [drag, H, open, close, onChange]);
  const startDrag = (mode: "move" | "resize") => (ev: React.PointerEvent) => {
    if (!canEdit || ev.button !== 0) return;
    ev.preventDefault();
    ev.stopPropagation();
    setDrag({ mode, startY: ev.clientY, a: d.a, b: d.b });
  };

  function autoFix() {
    const len = d.b - d.a;
    const active = others.filter((r) => isActive(r.status));
    for (let q = open; q + len <= close; q++) {
      if (!active.some((o) => o.slotStart < q + len && o.slotEnd > q)) {
        onChange({ a: q, b: q + len });
        onToast("Nalezen volný čas", `${slotLabel(q)} – ${slotLabel(q + len)} · ${dayLabel(d.date)}`, "ok", "sparkle");
        return;
      }
    }
    onToast("V tento den už není volno", "Zkuste jiné datum.", "warn", "alert");
  }

  const section = (icon: "user" | "calendar" | "car", label: string) => (
    <span className={styles.sectionLabel}>
      <Icon name={icon} size={14} />
      {label}
    </span>
  );

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div role="dialog" aria-modal="true" className={styles.orderModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.orderHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
            <span className={styles.avatar} style={{ background: avatarBg, color: avatarFg, border: d.status === "new" ? "1px dashed #1769ff" : "none" }}>
              {initials(d.name)}
            </span>
            <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
              <Heading level={2} size="dialog">
                {exists ? d.name || "" : "Založit objednávku po telefonu"}
              </Heading>
              <span className={styles.monoLabel}>{exists ? `Objednávka #${d.id} · ${STATUS_LABEL[d.status]}` : "Nová objednávka"}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {exists && d.phone && (
              <a href={`tel:${d.phone.replace(/\s/g, "")}`} className={styles.squareButton} title="Zavolat klientovi">
                <Icon name="phone" size={16} />
              </a>
            )}
            <button type="button" className={styles.squareButton} aria-label="Zavřít (Esc)" onClick={onClose}>
              <Icon name="close" size={16} />
            </button>
          </div>
        </div>

        <div className={styles.orderBody}>
          <div className={styles.orderMain}>
            <div style={{ display: "grid", gap: 14 }}>
              {section("user", "Klient")}
              <div className={styles.twoCols}>
                <Field label="Jméno">
                  <Input value={d.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Jméno a příjmení" />
                </Field>
                <Field label="Telefon">
                  <Input type="tel" value={d.phone} onChange={(e) => onChange({ phone: e.target.value })} placeholder="+420" />
                </Field>
                <Field label="E-mail">
                  <Input type="email" value={d.email} onChange={(e) => onChange({ email: e.target.value })} />
                </Field>
                <Field label="Adresa">
                  <Input value={d.address} onChange={(e) => onChange({ address: e.target.value })} placeholder="Ulice, město" />
                </Field>
              </div>
              {!exists && !d.email && customers.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#687080" }}>Stálý zákazník?</span>
                  {customers.slice(0, 4).map((c) => {
                    const last = [...c.orders].sort((x, y) => y.date.localeCompare(x.date))[0];
                    return (
                      <button key={c.email} type="button" className={styles.chip} onClick={() => onChange({ name: c.name, phone: c.phone, email: c.email, address: last.address })}>
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                {section("calendar", "Termín")}
                <span style={{ fontFamily: mono, fontSize: 12, color: "#1769ff" }}>{durationLabel(Math.max(0, d.b - d.a))}</span>
              </div>
              <div className={styles.timeGrid}>
                <Field label="Datum">
                  <Input type="date" value={d.date} onChange={(e) => onChange({ date: e.target.value })} />
                </Field>
                <Field label="Od">
                  <Select
                    options={timeOptions(open, close - 1)}
                    value={String(d.a)}
                    onChange={(e) => {
                      const a = Number(e.target.value);
                      onChange({ a, b: Math.max(d.b, a + 1) });
                    }}
                  />
                </Field>
                <Field label="Do">
                  <Select options={timeOptions(open + 1, close)} value={String(d.b)} onChange={(e) => onChange({ b: Number(e.target.value) })} />
                </Field>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#687080", marginRight: 4 }}>Posunout</span>
                {(
                  [
                    [-4, "− 1 h"],
                    [-1, "− 15 min"],
                    [1, "+ 15 min"],
                    [4, "+ 1 h"],
                  ] as Array<[number, string]>
                ).map(([n, label]) => (
                  <button key={label} type="button" className={styles.shiftChip} onClick={() => shift(n)}>
                    {label}
                  </button>
                ))}
                <button type="button" className={styles.shiftChip} onClick={() => onChange({ b: Math.min(close, d.b + 2) })}>
                  Prodloužit o 30 min
                </button>
                {conflicts.length > 0 && (
                  <button type="button" className={styles.autoFix} onClick={autoFix}>
                    <Icon name="sparkle" size={12} stroke={2} />
                    Najít nejbližší volný
                  </button>
                )}
              </div>
              {conflicts.length > 0 ? (
                <Notice tone="error">
                  Překrývá se s: {conflicts.map((c) => `${c.name} (${slotLabel(c.slotStart)} – ${slotLabel(c.slotEnd)})`).join(", ")}. Upravte čas podle domluvy s klientem, nebo posuňte druhou zakázku.
                </Notice>
              ) : (
                <Notice tone="info">Termín je volný, s ničím se nepřekrývá.</Notice>
              )}
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {section("car", "Služby a stav")}
              <div className={styles.serviceCards}>
                {packages.map((p) => {
                  const on = d.services.includes(p.name);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      onClick={() => onChange({ services: selectServices(d.services, on ? d.services.filter((s) => s !== p.name) : [...d.services, p.name]) })}
                      className={styles.serviceCard}
                      style={{ border: `1px solid ${on ? "#1769ff" : "#e1e5eb"}`, background: on ? "#1769ff" : "#fff", color: on ? "#fff" : "#080b12" }}
                    >
                      <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: 14 }}>{p.name}</strong>
                        {on && <Icon name="check" size={14} stroke={2.5} />}
                      </span>
                      <span style={{ fontFamily: mono, fontSize: 11, opacity: 0.75 }}>
                        {priceLabel(p.price, p.showCurrency)}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(Object.keys(STATUS_LABEL) as BookingStatus[]).map((k) => {
                  const on = d.status === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => onChange({ status: k })}
                      className={styles.statusChip}
                      style={{ border: `1px solid ${on ? "#080b12" : "#e1e5eb"}`, background: on ? "#080b12" : "#fff", color: on ? "#fff" : "#687080", fontWeight: on ? 600 : 400 }}
                    >
                      {STATUS_LABEL[k]}
                    </button>
                  );
                })}
              </div>
              <Field label="Poznámka pro technika">
                <Textarea value={d.note} onChange={(e) => onChange({ note: e.target.value })} rows={2} placeholder="Typ auta, vchod, domluvené detaily…" />
              </Field>
            </div>
          </div>

          <div className={styles.orderSide}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className={styles.monoLabel}>{d.date ? dayLabel(d.date) : ""}</span>
              <span style={{ fontSize: 11, color: "#687080" }}>
                {others.length ? `${others.length} dalš${others.length === 1 ? "í zakázka" : others.length < 5 ? "í zakázky" : "ích zakázek"}` : "jinak volný den"}
              </span>
            </div>
            <div className={styles.miniTimeline} style={{ height: MINI_H }}>
              {Array.from({ length: Math.ceil(rows / 4) }, (_, i) => open + i * 4).map((q) => (
                <span key={q} className={styles.miniHour} style={{ top: (q - open) * H }}>
                  {slotLabel(q)}
                </span>
              ))}
              {others.map((r) => {
                const conflict = isActive(r.status) && d.a < r.slotEnd && d.b > r.slotStart;
                return (
                  <div
                    key={r.id}
                    className={styles.miniEvent}
                    title={`${r.name} · ${STATUS_LABEL[r.status]}`}
                    style={{ top: (r.slotStart - open) * H, height: (r.slotEnd - r.slotStart) * H - 2, boxShadow: conflict ? "inset 0 0 0 1px #b42318" : "none" }}
                  >
                    <span>{`${r.name} · ${slotLabel(r.slotStart)} – ${slotLabel(r.slotEnd)}`}</span>
                  </div>
                );
              })}
              <div
                className={styles.miniDraft}
                data-dragging={drag ? "true" : "false"}
                title={canEdit ? "Tažením posunete, spodní hranou změníte délku" : undefined}
                onPointerDown={startDrag("move")}
                style={{
                  top: (d.a - open) * H,
                  height: Math.max(0, d.b - d.a) * H - 2,
                  background: conflicts.length ? "rgba(23,105,255,.75)" : "#1769ff",
                  boxShadow: conflicts.length ? "0 0 0 2px #b42318" : "none",
                }}
              >
                <span>{`${slotLabel(d.a)} – ${slotLabel(d.b)}`}</span>
                {canEdit && <div className={styles.miniResize} onPointerDown={startDrag("resize")} />}
              </div>
            </div>
            <span style={{ fontSize: 11, color: "#687080", lineHeight: 1.6 }}>Modrý blok je tato objednávka: tažením ho posunete, spodní hranou natáhnete. Šedé jsou ostatní zakázky, červený okraj značí překryv.</span>
          </div>
        </div>

        <div className={styles.orderFooter}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {exists && canEdit && (
              <Button variant="outline-danger" size="sm" onClick={onDelete}>
                Smazat
              </Button>
            )}
            <span style={{ fontSize: 12, color: "#687080" }}>{dirty ? "Neuložené změny · Ctrl+Enter uloží" : !exists ? "Ctrl+Enter uloží" : ""}</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="ghost" onClick={onClose}>
              Zavřít
            </Button>
            {canEdit && d.status === "new" && (
              <Button variant="dark" onClick={() => onSave("confirmed")}>
                Potvrdit termín
              </Button>
            )}
            {canEdit && (
              <Button variant="primary" onClick={() => onSave()}>
                {exists ? "Uložit změny" : "Založit objednávku"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
