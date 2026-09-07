"use client";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Button, Dialog, Icon, Input, Notice, ServiceChecklist, Textarea, type IconName } from "@homedetailing/ui";
import {
  dayLabel,
  defaultSettings,
  durationLabel,
  publicBookingStarts,
  settingsForDate,
  PUBLIC_BOOKING_STEP_MINUTES,
  PUBLIC_BOOKING_DURATION_SLOTS,
  MONTHS,
  priceList,
  servicesLabel,
  slotLabel,
  toIso,
  type Settings,
} from "@/lib/booking";
import styles from "@/app/landing.module.css";
import { selectServices } from "@/lib/service-selection";

export type PricePackage = { id: number; name: string; price: string; showCurrency: boolean; items: string[]; featured: boolean; durationMinutes: number };
type DayInfo = { closed: boolean; busy: Array<[number, number]> };
type Availability = { settings: Settings; today: string; days: Record<string, DayInfo> };

const mono = "var(--hd-font-mono)";
const WEEKDAYS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

export type BookingFormProps = {
  packages: PricePackage[];
  onToast: (message: string, icon?: IconName) => void;
  active?: boolean;
};

/**
 * Booking section: day → start time → services. Each booking blocks three hours.
 */
export function BookingForm({ packages, onToast, active = true }: BookingFormProps) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [today, setToday] = useState(() => toIso(new Date()));
  const [days, setDays] = useState<Record<string, DayInfo>>({});
  const [month, setMonth] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [day, setDay] = useState<string | null>(null);
  const [a, setA] = useState<number | null>(null);
  const [services, setServices] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const slotsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const narrow = () => typeof window !== "undefined" && window.innerWidth < 900;
  const scrollTo = (el: HTMLElement | null) => {
    if (el && narrow()) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentSummary, setSentSummary] = useState("");

  const loadRange = useCallback((from: string, to: string) =>
    fetch(`/api/v2/availability?from=${from}&to=${to}`, { cache: "no-store" })
      .then(response => {
        if (!response.ok) throw new Error("Availability failed");
        return response.json() as Promise<Availability>;
      })
      .then(data => {
        setSettings(data.settings);
        setToday(data.today);
        setDays(prev => ({ ...prev, ...data.days }));
        setError("");
      })
      .catch(() => {
        setDays({});
        setError("Dostupné termíny se nepodařilo načíst. Zkuste rezervaci znovu otevřít.");
      }), []);

  // Refresh the displayed month on each opening so saved hours are reflected.
  useEffect(() => {
    if (!active) return;
    const first = toIso(month);
    const last = toIso(new Date(month.getFullYear(), month.getMonth() + 1, 0));
    const from = first < today ? today : first;
    void loadRange(from, last);
  }, [active, month, today, loadRange]);

  const busyOf = useCallback(
    (iso: string): Array<[number, number]> | null => {
      const info = days[iso];
      return !info || info.closed ? null : info.busy;
    },
    [days],
  );

  /* ---- derived selection ---- */

  const busy = day ? busyOf(day) : null;
  const daySettings = day ? settingsForDate(day, settings) : settings;
  const dayOpen = busy !== null;
  const availableStarts = busy === null ? [] : publicBookingStarts(daySettings, busy);
  const n = a !== null ? PUBLIC_BOOKING_DURATION_SLOTS : 0;
  const end = a !== null ? a + PUBLIC_BOOKING_DURATION_SLOTS : null;

  function pickDay(iso: string) {
    setDay(iso);
    setA(null);
    setError("");
    setTimeout(() => scrollTo(slotsRef.current), 50);
  }

  function pickSlot(i: number) {
    if (!day || !availableStarts.includes(i)) return;
    setA(i);
    setError("");
    onToast(`Termín vybrán: ${dayLabel(day)} ${slotLabel(i)} – ${slotLabel(i + PUBLIC_BOOKING_DURATION_SLOTS)}`, "calendar");
    setTimeout(() => scrollTo(servicesRef.current), 50);
  }

  function changeServices(next: string[]) {
    setServices(previous => selectServices(previous, next));
    setError("");
  }

  /* ---- calendar grid ---- */

  const first = month;
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const rows = Math.ceil((offset + daysInMonth) / 7);
  const curMonth = new Date(Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1, 1);
  const cells = [];
  for (let c = 0; c < rows * 7; c++) {
    const n = c - offset + 1;
    if (n < 1 || n > daysInMonth) {
      cells.push(<span key={`pad-${c}`} style={{ height: 46 }} />);
      continue;
    }
    const iso = toIso(new Date(first.getFullYear(), first.getMonth(), n));
    const info = days[iso];
    const past = iso < today;
    const closed = !past && (!info || info.closed);
    const full = !past && !closed && info !== undefined && publicBookingStarts(settings, info.busy, iso).length === 0;
    const disabled = past || closed || full;
    const selected = day === iso;
    const isToday = iso === today;
    cells.push(
      <button
        key={iso}
        type="button"
        disabled={disabled}
        onClick={() => pickDay(iso)}
        style={{
          height: 46,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          fontFamily: mono,
          fontSize: 13,
          cursor: disabled ? "default" : "pointer",
          border: `1px solid ${selected ? "#fff" : isToday ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.22)"}`,
          color: selected ? "#1769ff" : "#fff",
          background: selected ? "#fff" : "transparent",
          opacity: disabled ? 0.3 : 1,
          textDecoration: closed && info?.closed && !past ? "line-through" : "none",
          fontWeight: selected || isToday ? 700 : 400,
          transition: "background 120ms, color 120ms",
          padding: 0,
        }}
      >
        {n}
      </button>,
    );
  }
  const monthLabel = `${MONTHS[first.getMonth()]} ${first.getFullYear()}`;

  /* ---- slot grid ---- */

  const slots = [];
  if (busy && day) {
    const starts = publicBookingStarts(daySettings);
    for (const i of starts) {
      const slotBusy = !availableStarts.includes(i);
      const inSel = a === i;
      slots.push(
        <button
          key={i}
          type="button"
          disabled={slotBusy}
          onClick={() => pickSlot(i)}
          aria-pressed={inSel}
          aria-label={`Začátek ${slotLabel(i)}, rezervováno do ${slotLabel(i + PUBLIC_BOOKING_DURATION_SLOTS)}`}
          style={{
            padding: "12px 0",
            textAlign: "center",
            fontFamily: mono,
            fontSize: 12,
            border: `1px solid ${inSel ? "#fff" : "rgba(255,255,255,.22)"}`,
            color: inSel ? "#1769ff" : "#fff",
            background: inSel ? "#fff" : "transparent",
            cursor: slotBusy ? "not-allowed" : "pointer",
            opacity: slotBusy ? 0.3 : 1,
            textDecoration: slotBusy ? "line-through" : "none",
            fontWeight: inSel ? 700 : 400,
            transition: "background 100ms",
            userSelect: "none",
          }}
        >
          {slotLabel(i)}
        </button>,
      );
    }
  }

  /* ---- labels ---- */

  const summary = !day
    ? "Zatím nic nevybráno"
    : a === null
      ? `${dayLabel(day)} · vyberte začátek`
      : `${dayLabel(day)} · ${slotLabel(a)} – ${slotLabel(end!)}`;
  const slotHint = !day
    ? "nejdřív vyberte den"
    : a === null
      ? `${slotLabel(daySettings.openSlot)} – ${slotLabel(daySettings.closeSlot)} · krok ${PUBLIC_BOOKING_STEP_MINUTES} min`
      : "kliknutím změníte začátek";

  const tile = (done: boolean) => ({
    display: "grid",
    gap: 6,
    padding: "14px 16px",
    border: `1px solid rgba(255,255,255,${done ? ".7" : ".25"})`,
    background: done ? "rgba(255,255,255,.14)" : "transparent",
    minWidth: 0,
  });
  const progress: Array<{ icon: IconName; label: string; value: string; done: boolean }> = [
    { icon: day ? "check" : "calendar", label: "01 · Den", value: day ? dayLabel(day) : "Vyberte v kalendáři", done: Boolean(day) },
    {
      icon: n ? "check" : "clock",
      label: "02 · Čas",
      value: a !== null && end !== null ? `${slotLabel(a)} – ${slotLabel(end)} · ${durationLabel(n)}` : `Začátky po ${PUBLIC_BOOKING_STEP_MINUTES} min`,
      done: n > 0,
    },
    { icon: services.length ? "check" : "car", label: "03 · Služby", value: services.length ? servicesLabel(services) : "Zaškrtněte služby", done: services.length > 0 },
  ];


  /* ---- submit ---- */

  function validateFields(fields: Record<string, string>) {
    const errors: Record<string, string> = {};
    if (fields.name.trim().split(/\s+/).filter(Boolean).length < 2) errors.name = "Zadejte jméno i příjmení.";
    if (fields.phone.replace(/\D/g, "").length < 9) errors.phone = "Zadejte telefon včetně předvolby.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) errors.email = "Zadejte platný e-mail.";
    if (!fields.address.trim()) errors.address = "Napište adresu, kde auto stojí.";
    return errors;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    if (!day) {
      onToast("Nejdřív vyberte den v kalendáři.", "alert");
      setError("Vyberte prosím den v kalendáři.");
      scrollTo(form);
      return;
    }
    if (a === null || end === null || !availableStarts.includes(a)) {
      setError("Vyberte prosím dostupný čas začátku.");
      scrollTo(slotsRef.current);
      return;
    }
    if (!services.length) {
      setError("Vyberte prosím alespoň jednu službu.");
      scrollTo(servicesRef.current);
      return;
    }
    const fields = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const errors = validateFields(fields);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      const first = form.querySelector<HTMLElement>(`[name="${Object.keys(errors)[0]}"]`);
      first?.focus();
      if (narrow()) first?.scrollIntoView({ behavior: "smooth", block: "center" });
      setError("");
      return;
    }
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/v2/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, services, date: day, a, b: end }),
        signal: AbortSignal.timeout(15_000),
      });
      if (response.ok) {
        setSentSummary(`${servicesLabel(services)}, ${summary} (${durationLabel(n)}).`);
        setSent(true);
        form.reset();
        onToast("Rezervace odeslána. Potvrzení přijde na e-mail.", "check-circle");
        void loadRange(day, day);
      } else {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Rezervaci se nepodařilo odeslat. Zkuste to znovu.");
        if (response.status === 409) {
          setA(null);
          void loadRange(day, day);
        }
      }
    } catch {
      setError("Spojení se přerušilo. Než rezervaci odešlete znovu, ověřte u nás, zda dorazila.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className={styles.progress}>
        {progress.map((p) => (
          <div key={p.label} style={tile(p.done)}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: mono, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" }}>
              <Icon name={p.icon} size={14} stroke={2} />
              {p.label}
            </span>
            <strong style={{ fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.value}</strong>
          </div>
        ))}
      </div>

      <form className={styles.bookingForm} onSubmit={submit} noValidate>
        <div className={styles.bookingLeft}>
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <span className={styles.stepLabel}>01 · Den</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label="Předchozí měsíc"
                  onClick={() => {
                    if (first > curMonth) setMonth(new Date(first.getFullYear(), first.getMonth() - 1, 1));
                  }}
                >
                  <Icon name="chevron-left" size={16} stroke={2} />
                </button>
                <strong style={{ minWidth: 140, textAlign: "center", fontSize: 15 }}>{monthLabel}</strong>
                <button type="button" className={styles.iconButton} aria-label="Další měsíc" onClick={() => setMonth(new Date(first.getFullYear(), first.getMonth() + 1, 1))}>
                  <Icon name="chevron-right" size={16} stroke={2} />
                </button>
              </div>
            </div>
            <div className={styles.calendar}>
              {WEEKDAYS.map((w) => (
                <span key={w} className={styles.weekday}>
                  {w}
                </span>
              ))}
              {cells}
            </div>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
              <span className={styles.stepLabel}>02 · Čas začátku</span>
              <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: ".06em", opacity: 0.8 }}>{slotHint}</span>
            </div>
            {day && !dayOpen && <div className={styles.closedDay}>V tento den nejezdíme. Vyberte prosím jiný.</div>}
            <p style={{ margin: 0, fontSize: 13 }}>Vyberte jen začátek. Pro vaši rezervaci vyhradíme 3 hodiny.</p>
            {dayOpen && availableStarts.length === 0 && <div className={styles.closedDay}>V tento den už není volný tříhodinový termín.</div>}
            {dayOpen && (
              <div
                ref={slotsRef}
                className={styles.slots}
                style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}
              >
                {slots}
              </div>
            )}
            <div className={styles.summary}>
              <div style={{ display: "grid", gap: 2 }}>
                <span className={styles.stepLabel} style={{ opacity: 0.75 }}>
                  Vybraný termín
                </span>
                <strong style={{ fontSize: 17 }}>{summary}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontFamily: mono, fontSize: 13, whiteSpace: "nowrap" }}>{n ? durationLabel(n) : ""}</span>
                {a !== null && (
                  <button
                    type="button"
                    className={`${styles.iconButton} ${styles.iconButtonSmall}`}
                    aria-label="Zrušit výběr"
                    onClick={() => {
                      setA(null);
                    }}
                  >
                    <Icon name="close" size={14} stroke={2} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bookingRight} ref={servicesRef}>
          <span className={styles.stepLabel}>03 · Služby a kontakt</span>
          <ServiceChecklist options={packages} values={services} onChange={changeServices} />
          <p style={{ margin: 0, fontSize: 13 }}>Pro interiér vyberte Basic, nebo Premium. Exteriér můžete přidat k oběma.</p>


          <div className={styles.twoCols}>
            <div style={{ display: "grid", gap: 6 }}>
              <Input tone="on-blue" name="name" placeholder="Jméno a příjmení" autoComplete="name" aria-invalid={fieldErrors.name ? "true" : undefined} onChange={() => fieldErrors.name && setFieldErrors((e) => ({ ...e, name: "" }))} />
              {fieldErrors.name && <span className="hd-field-error hd-field-error--on-blue">{fieldErrors.name}</span>}
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <Input tone="on-blue" type="tel" name="phone" placeholder="Telefon" autoComplete="tel" aria-invalid={fieldErrors.phone ? "true" : undefined} onChange={() => fieldErrors.phone && setFieldErrors((e) => ({ ...e, phone: "" }))} />
              {fieldErrors.phone && <span className="hd-field-error hd-field-error--on-blue">{fieldErrors.phone}</span>}
            </div>
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <Input tone="on-blue" type="email" name="email" placeholder="E-mail" autoComplete="email" aria-invalid={fieldErrors.email ? "true" : undefined} onChange={() => fieldErrors.email && setFieldErrors((e) => ({ ...e, email: "" }))} />
            {fieldErrors.email && <span className="hd-field-error hd-field-error--on-blue">{fieldErrors.email}</span>}
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <Input tone="on-blue" name="address" placeholder="Adresa, kde auto stojí" autoComplete="street-address" aria-invalid={fieldErrors.address ? "true" : undefined} onChange={() => fieldErrors.address && setFieldErrors((e) => ({ ...e, address: "" }))} />
            {fieldErrors.address && <span className="hd-field-error hd-field-error--on-blue">{fieldErrors.address}</span>}
          </div>
          <Textarea tone="on-blue" name="note" placeholder="Poznámka (typ auta, vchod, cokoliv důležitého)" rows={3} />
          {error && <Notice tone="on-blue">{error}</Notice>}
          <div className={styles.priceRow}>
            <span className={styles.stepLabel} style={{ opacity: 0.75 }}>
              Cena
            </span>
            <strong style={{ fontSize: 15, textAlign: "right" }}>{services.length ? priceList(services, packages) : "—"}</strong>
          </div>
          <Button type="submit" variant="light" fullWidth icon="arrow-up-right" disabled={sending}>
            {sending ? "Odesílám…" : "Odeslat rezervaci"}
          </Button>
          <span className={styles.gdpr}>Odesláním souhlasíte se zpracováním údajů pro účely rezervace. Termín potvrdíme telefonicky nebo e-mailem.</span>
        </div>
      </form>

      <Dialog
        open={sent}
        eyebrow="Rezervace odeslána"
        title="Děkujeme, termín je zarezervován."
        actions={
          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              setSent(false);
              setDay(null);
              setA(null);
              setServices([]);
            }}
          >
            Rozumím
          </Button>
        }
      >
        {sentSummary} Potvrzení přijde na e-mail. Pokud bude potřeba čas upravit, ozveme se telefonicky.
      </Dialog>
    </>
  );
}
