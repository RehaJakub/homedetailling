"use client";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Dialog, Icon, Input, Notice, ServiceChecklist, Textarea, type IconName } from "@homedetailing/ui";
import {
  addDays,
  dayLabel,
  defaultSettings,
  durationLabel,
  estimateSlots,
  firstFree,
  freeCount,
  isSlotBusy,
  MONTHS,
  priceList,
  servicesLabel,
  slotLabel,
  toIso,
  type Settings,
} from "@/lib/booking";
import styles from "@/app/landing.module.css";

export type PricePackage = { id: number; name: string; price: string; showCurrency: boolean; items: string[]; featured: boolean; durationMinutes: number };
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
 * Booking section: month calendar → 15-minute from–to range → ticked services.
 * The customer picks the range themselves; the summed package estimate is only
 * a hint, and a warning appears when the chosen range is shorter than it.
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
  const [services, setServices] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentSummary, setSentSummary] = useState("");

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

  const busyOf = useCallback(
    (iso: string): Array<[number, number]> | null => {
      const info = days[iso];
      return !info || info.closed ? null : info.busy;
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

  /* ---- derived selection ---- */

  const estimate = estimateSlots(services, packages);
  const busy = day ? busyOf(day) : null;
  const dayOpen = busy !== null;
  const isBusy = (i: number) => busy === null || isSlotBusy(i, busy);
  // b is the last selected slot (inclusive); the booking end is b + 1.
  const n = a !== null && b !== null ? b - a + 1 : 0;
  const end = a !== null && b !== null ? b + 1 : null;
  const tooShort = n > 0 && estimate > 0 && n < estimate;
  // Can the range be stretched to the estimate without hitting a busy slot or closing time?
  const extendedEnd = a !== null ? a + estimate : null;
  const canExtend =
    tooShort && a !== null && extendedEnd !== null && extendedEnd <= settings.closeSlot && Array.from({ length: estimate }, (_, k) => a + k).every((i) => !isBusy(i));

  function pickDay(iso: string) {
    setDay(iso);
    setA(null);
    setB(null);
    setHov(null);
    setError("");
  }

  function pickSlot(i: number) {
    if (!day || isBusy(i)) return;
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
      if (isBusy(k)) {
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

  function changeServices(next: string[]) {
    setServices(next);
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

  /* ---- slot grid ---- */

  const slots = [];
  if (busy && day) {
    for (let i = settings.openSlot; i < settings.closeSlot; i++) {
      const slotBusy = isBusy(i);
      const inSel = a !== null && (b !== null ? i >= a && i <= b : i === a);
      const inHov = a !== null && b === null && hov !== null && i > a && i <= hov;
      // Slots the estimate would still need beyond the chosen end.
      const wanted = tooShort && a !== null && end !== null && i >= end && i < a + estimate && !slotBusy;
      slots.push(
        <button
          key={i}
          type="button"
          disabled={slotBusy}
          onClick={() => pickSlot(i)}
          onMouseEnter={() => {
            if (a !== null && b === null) setHov(i);
          }}
          style={{
            padding: "10px 0",
            textAlign: "center",
            fontFamily: mono,
            fontSize: 12,
            border: `1px solid ${inSel ? "#fff" : wanted ? "rgba(255,224,224,.8)" : "rgba(255,255,255,.22)"}`,
            color: inSel ? "#1769ff" : "#fff",
            background: inSel ? "#fff" : inHov ? "rgba(255,255,255,.28)" : wanted ? "rgba(255,255,255,.14)" : "transparent",
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
      : b === null
        ? `${dayLabel(day)} · od ${slotLabel(a)} · klikněte na konec`
        : `${dayLabel(day)} · ${slotLabel(a)} – ${slotLabel(b + 1)}`;
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
    { icon: services.length ? "check" : "car", label: "03 · Služby", value: services.length ? servicesLabel(services) : "Zaškrtněte služby", done: services.length > 0 },
  ];

  const shortNote = tooShort ? `Odhad služeb ${durationLabel(estimate)}, zákazník rezervoval ${durationLabel(n)} – nemusíme vše stihnout, domluvit postup.` : "";

  /* ---- submit ---- */

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!day) {
      onToast("Nejdřív vyberte den v kalendáři.", "alert");
      setError("Vyberte prosím den v kalendáři.");
      return;
    }
    if (a === null || b === null || end === null) return setError("Vyberte prosím čas od a do.");
    if (!services.length) return setError("Vyberte prosím alespoň jednu službu.");
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const note = shortNote ? `${shortNote} ${fields.note ?? ""}`.trim() : fields.note;
    setSending(true);
    setError("");
    const response = await fetch("/api/v2/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, note, services, date: day, a, b: end }),
    });
    setSending(false);
    if (response.ok) {
      setSentSummary(`${servicesLabel(services)}, ${summary} (${durationLabel(n)}).${shortNote ? " Úsek je kratší než odhad služeb, ozveme se a domluvíme postup." : ""}`);
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

      <form className={styles.bookingForm} onSubmit={submit}>
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
          <span className={styles.stepLabel}>03 · Služby a kontakt</span>
          <ServiceChecklist options={packages} values={services} onChange={changeServices} />

          <div className={styles.estimateRow}>
            <div style={{ display: "grid", gap: 2 }}>
              <span className={styles.stepLabel} style={{ opacity: 0.75 }}>
                Odhadovaný čas · orientačně
              </span>
              <strong style={{ fontSize: 17 }}>{estimate ? durationLabel(estimate) : "vyberte služby"}</strong>
            </div>
            <span style={{ fontSize: 12, opacity: 0.8, textAlign: "right", maxWidth: 190 }}>Čas od–do si vybíráte sami v mřížce vlevo.</span>
          </div>

          {tooShort && a !== null && (
            <Notice tone="on-blue" style={{ color: "#fff" }}>
              Vybraný úsek ({durationLabel(n)}) je kratší než odhad na zvolené služby ({durationLabel(estimate)}). Nemusíme všechno stihnout.
              <span className={styles.warnChips}>
                {canExtend && extendedEnd !== null && (
                  <button type="button" className={styles.warnChip} onClick={() => setB(extendedEnd - 1)}>
                    Prodloužit do {slotLabel(extendedEnd)}
                  </button>
                )}
                <span style={{ opacity: 0.85 }}>{canExtend ? "nebo nechte jak je – ozveme se a domluvíme postup." : "Po odeslání se ozveme a domluvíme, jak to rozdělit nebo posunout."}</span>
              </span>
            </Notice>
          )}

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
              setB(null);
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
