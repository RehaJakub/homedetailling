"use client";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Dialog, Icon, Input, Notice, ServiceDropdown, Textarea, type IconName } from "@homedetailing/ui";
import {
  addDays,
  dayLabel,
  defaultSettings,
  durationLabel,
  firstFree,
  freeCount,
  isSlotBusy,
  MONTHS,
  priceLabel,
  slotLabel,
  toIso,
  type Settings,
} from "@/lib/booking";
import styles from "@/app/landing.module.css";

export type PricePackage = { id: number; name: string; price: string; showCurrency: boolean; items: string[]; featured: boolean };
type DayInfo = { closed: boolean; busy: Array<[number, number]> };
type Availability = { settings: Settings; today: string; days: Record<string, DayInfo> };

const mono = "var(--hd-font-mono)";
const WEEKDAYS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

export type BookingFormProps = {
  packages: PricePackage[];
  onToast: (message: string, icon?: IconName) => void;
  /** Receives the "next free slot" label whenever it changes (hero badge + floating CTA). */
  onNextFree: (label: string) => void;
  /** Called with `true` while the success dialog is open (hides the floating CTA). */
  onSentChange: (sent: boolean) => void;
};

/**
 * Booking section: month calendar → 15-minute slot grid (from–to range) →
 * service and contact. Availability comes from /api/v2/availability; the
 * selection logic mirrors the design prototype 1:1.
 */
export function BookingForm({ packages, onToast, onNextFree, onSentChange }: BookingFormProps) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [today, setToday] = useState(() => toIso(new Date()));
  const [days, setDays] = useState<Record<string, DayInfo>>({});
  const loadedMonths = useRef(new Set<string>());
  const [month, setMonth] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [day, setDay] = useState<string | null>(null);
  const [a, setA] = useState<number | null>(null);
  const [b, setB] = useState<number | null>(null);
  const [hov, setHov] = useState<number | null>(null);
  const [service, setService] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentSummary, setSentSummary] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const loadRange = useCallback(async (from: string, to: string) => {
    try {
      const response = await fetch(`/api/v2/availability?from=${from}&to=${to}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as Availability;
      setSettings(data.settings);
      setToday(data.today);
      setDays((prev) => ({ ...prev, ...data.days }));
    } catch {
      /* offline: calendar stays disabled */
    }
  }, []);

  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;

  // Current month (clipped to today) plus the next two weeks for the "next free" badge.
  useEffect(() => {
    if (loadedMonths.current.has(monthKey)) return;
    loadedMonths.current.add(monthKey);
    const first = toIso(month);
    const last = toIso(new Date(month.getFullYear(), month.getMonth() + 1, 0));
    const from = first < today ? today : first;
    const to = last < addDays(today, 13) ? addDays(today, 13) : last;
    void loadRange(from, to);
  }, [monthKey, month, today, loadRange]);

  const isBusy = useCallback(
    (iso: string, slot: number) => {
      const info = days[iso];
      if (!info || info.closed) return true;
      return isSlotBusy(slot, info.busy);
    },
    [days],
  );

  const nextFreeLabel = useMemo(() => {
    for (let k = 0; k < 14; k++) {
      const iso = addDays(today, k);
      const info = days[iso];
      if (!info) return "…";
      if (info.closed || freeCount(info.busy, settings) === 0) continue;
      const slot = firstFree(info.busy, settings);
      if (slot === null) continue;
      return `${k === 0 ? "Dnes" : k === 1 ? "Zítra" : dayLabel(iso)} ${slotLabel(slot)}`;
    }
    return "Po domluvě";
  }, [days, today, settings]);

  useEffect(() => onNextFree(nextFreeLabel), [nextFreeLabel, onNextFree]);
  useEffect(() => onSentChange(sent), [sent, onSentChange]);

  function pickDay(iso: string) {
    setDay(iso);
    setA(null);
    setB(null);
    setHov(null);
    setError("");
  }

  function pickSlot(i: number) {
    if (!day || isBusy(day, i)) return;
    if (a === null || b !== null) {
      setA(i);
      setB(null);
      setError("");
      return;
    }
    if (i < a) {
      setA(i);
      return;
    }
    for (let k = a; k <= i; k++) {
      if (isBusy(day, k)) {
        onToast(`Mezi začátkem a koncem je obsazený čas. Začínáme znovu od ${slotLabel(i)}.`, "alert");
        setA(i);
        setB(null);
        return;
      }
    }
    setB(i);
    setError("");
    onToast(`Termín vybrán: ${dayLabel(day)} ${slotLabel(a)} – ${slotLabel(i + 1)}`, "calendar");
  }

  // Calendar grid
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
    const full = !past && !closed && info !== undefined && freeCount(info.busy, settings) === 0;
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
  const dayInfo = day ? days[day] : undefined;
  const dayOpen = Boolean(day && dayInfo && !dayInfo.closed);

  // Slot grid
  const slots = [];
  if (dayOpen && day) {
    for (let i = settings.openSlot; i < settings.closeSlot; i++) {
      const busy = isBusy(day, i);
      const inSel = a !== null && (b !== null ? i >= a && i <= b : i === a);
      const inHov = a !== null && b === null && hov !== null && i > a && i <= hov;
      slots.push(
        <button
          key={i}
          type="button"
          disabled={busy}
          onClick={() => pickSlot(i)}
          onMouseEnter={() => {
            if (a !== null && b === null) setHov(i);
          }}
          style={{
            padding: "10px 0",
            textAlign: "center",
            fontFamily: mono,
            fontSize: 12,
            border: `1px solid ${inSel ? "#fff" : "rgba(255,255,255,.22)"}`,
            color: inSel ? "#1769ff" : "#fff",
            background: inSel ? "#fff" : inHov ? "rgba(255,255,255,.28)" : "transparent",
            cursor: busy ? "not-allowed" : "pointer",
            opacity: busy ? 0.3 : 1,
            textDecoration: busy ? "line-through" : "none",
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

  const n = a !== null && b !== null ? b - a + 1 : 0;
  const summary = !day
    ? "Zatím nic nevybráno"
    : a === null
      ? `${dayLabel(day)} · vyberte začátek`
      : b === null
        ? `${dayLabel(day)} · od ${slotLabel(a)} · klikněte na konec`
        : `${dayLabel(day)} · ${slotLabel(a)} – ${slotLabel(b + 1)}`;
  const pkg = packages.find((p) => p.name === service);
  const slotHint = !day
    ? "nejdřív vyberte den"
    : a === null
      ? `${slotLabel(settings.openSlot)} – ${slotLabel(settings.closeSlot)} · krok 15 min`
      : b === null
        ? "teď zvolte konec"
        : "kliknutím vyberete znovu";

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
      value: n && a !== null && b !== null ? `${slotLabel(a)} – ${slotLabel(b + 1)} · ${durationLabel(n)}` : a !== null ? `od ${slotLabel(a)} · zvolte konec` : "Od – do po 15 min",
      done: n > 0,
    },
    { icon: service ? "check" : "car", label: "03 · Služba", value: pkg ? pkg.name : "Vyberte balíček", done: Boolean(service) },
  ];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!day) {
      onToast("Nejdřív vyberte den v kalendáři.", "alert");
      setError("Vyberte prosím den v kalendáři.");
      return;
    }
    if (a === null || b === null) return setError("Vyberte prosím čas od a do.");
    if (!service) return setError("Vyberte prosím službu.");
    const form = event.currentTarget;
    setSending(true);
    setError("");
    const response = await fetch("/api/v2/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...Object.fromEntries(new FormData(form)), date: day, a, b: b + 1 }),
    });
    setSending(false);
    if (response.ok) {
      setSentSummary(`${service}, ${summary} (${durationLabel(n)}).`);
      setSent(true);
      form.reset();
      onToast("Rezervace odeslána. Potvrzení přijde na e-mail.", "check-circle");
      void loadRange(day, day);
    } else {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Rezervaci se nepodařilo odeslat. Zkuste to znovu.");
      if (response.status === 409) {
        setA(null);
        setB(null);
        void loadRange(day, day);
      }
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

      <form ref={formRef} className={styles.bookingForm} onSubmit={submit}>
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
              <span className={styles.stepLabel}>02 · Čas od – do</span>
              <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: ".06em", opacity: 0.8 }}>{slotHint}</span>
            </div>
            {day && !dayOpen && <div className={styles.closedDay}>V tento den nejezdíme. Vyberte prosím jiný.</div>}
            {dayOpen && (
              <div
                className={styles.slots}
                onMouseLeave={() => {
                  if (hov !== null) setHov(null);
                }}
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
                      setB(null);
                      setHov(null);
                    }}
                  >
                    <Icon name="close" size={14} stroke={2} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bookingRight}>
          <span className={styles.stepLabel}>03 · Služba a kontakt</span>
          <ServiceDropdown
            options={packages}
            value={service}
            onChange={(name) => {
              setService(name);
              setError("");
            }}
            placeholder="Vyberte službu"
          />
          <div className={styles.twoCols}>
            <Input tone="on-blue" name="name" placeholder="Jméno a příjmení" pattern="\S+(?:\s+\S+)+" title="Zadejte jméno i příjmení." autoComplete="name" required />
            <Input tone="on-blue" type="tel" name="phone" placeholder="Telefon" minLength={9} autoComplete="tel" required />
          </div>
          <Input tone="on-blue" type="email" name="email" placeholder="E-mail" autoComplete="email" required />
          <Input tone="on-blue" name="address" placeholder="Adresa, kde auto stojí" autoComplete="street-address" required />
          <Textarea tone="on-blue" name="note" placeholder="Poznámka (typ auta, vchod, cokoliv důležitého)" rows={3} />
          {error && <Notice tone="on-blue">{error}</Notice>}
          <div className={styles.priceRow}>
            <span className={styles.stepLabel} style={{ opacity: 0.75 }}>
              Cena
            </span>
            <strong style={{ fontSize: 20 }}>{pkg ? priceLabel(pkg.price, pkg.showCurrency) : "—"}</strong>
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
              setB(null);
              setService("");
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
