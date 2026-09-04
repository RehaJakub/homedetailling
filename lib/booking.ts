// Pure booking helpers shared by the API, the landing page and the admin.
// Time is measured in quarter-hour slots since midnight: 7:00 = 28, 19:00 = 76.

export type BookingStatus = "new" | "confirmed" | "done" | "cancelled";

export type BookingLike = {
  id?: number | null;
  date: string;
  slotStart: number;
  slotEnd: number;
  status: BookingStatus;
};

export type Settings = {
  openSlot: number;
  closeSlot: number;
  /** Monday-first flags, 1 = working day. */
  workDays: number[];
  stepMinutes: number;
  bufferMinutes: number;
};

export const SLOTS_PER_DAY = 96;
export const STATUS_LABEL: Record<BookingStatus, string> = {
  new: "Čeká na potvrzení",
  confirmed: "Potvrzeno",
  done: "Hotovo",
  cancelled: "Zrušeno",
};
export const DOW_SHORT = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"];
export const DOW_LONG = ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota"];
export const MONTHS = ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"];

export const defaultSettings: Settings = { openSlot: 28, closeSlot: 76, workDays: [1, 1, 1, 1, 1, 1, 0], stepMinutes: 15, bufferMinutes: 30 };

export function isActive(status: BookingStatus) {
  return status === "new" || status === "confirmed";
}

/** ISO date (YYYY-MM-DD) of a local Date. */
export function toIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function fromIso(iso: string) {
  return new Date(`${iso}T00:00:00`);
}

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = fromIso(value);
  return !Number.isNaN(d.getTime()) && toIso(d) === value;
}

export function addDays(iso: string, days: number) {
  const d = fromIso(iso);
  d.setDate(d.getDate() + days);
  return toIso(d);
}

/** "7:00", "13:45" */
export function slotLabel(slot: number) {
  return `${Math.floor(slot / 4)}:${["00", "15", "30", "45"][((slot % 4) + 4) % 4]}`;
}

/** "2 h 30 min" */
export function durationLabel(slots: number) {
  const h = Math.floor(slots / 4);
  const m = (slots % 4) * 15;
  return `${h ? `${h} h` : ""}${h && m ? " " : ""}${m ? `${m} min` : ""}`;
}

/** "Út 8. 9." */
export function dayLabel(iso: string) {
  const d = fromIso(iso);
  return `${DOW_SHORT[d.getDay()]} ${d.getDate()}. ${d.getMonth() + 1}.`;
}

/** Monday-first index 0..6 of an ISO date. */
export function weekdayIndex(iso: string) {
  return (fromIso(iso).getDay() + 6) % 7;
}

export function isWorkDay(iso: string, s: Settings) {
  return Boolean(s.workDays[weekdayIndex(iso)]);
}

export function overlaps(a: { slotStart: number; slotEnd: number }, b: { slotStart: number; slotEnd: number }) {
  return a.slotStart < b.slotEnd && a.slotEnd > b.slotStart;
}

/** Active bookings on the same day that overlap `r` (strict overlap, no buffer). */
export function conflictsOf<T extends BookingLike>(r: BookingLike, all: T[]) {
  return all.filter((o) => o.id !== r.id && o.date === r.date && isActive(o.status) && overlaps(o, r));
}

/**
 * Slot ranges the public calendar must show as busy on `date`: every active
 * booking widened by the buffer on both sides, plus everything before `nowSlot`
 * when the day is today. Ranges are clipped to opening hours.
 */
export function busyRanges(date: string, bookings: BookingLike[], s: Settings, nowSlot?: number): Array<[number, number]> {
  const pad = Math.ceil(s.bufferMinutes / 15);
  const ranges: Array<[number, number]> = [];
  for (const b of bookings) {
    if (b.date !== date || !isActive(b.status)) continue;
    ranges.push([Math.max(s.openSlot, b.slotStart - pad), Math.min(s.closeSlot, b.slotEnd + pad)]);
  }
  if (nowSlot !== undefined && nowSlot > s.openSlot) ranges.push([s.openSlot, Math.min(s.closeSlot, nowSlot + 1)]);
  return mergeRanges(ranges);
}

export function mergeRanges(ranges: Array<[number, number]>) {
  const sorted = ranges.filter(([a, b]) => b > a).sort((x, y) => x[0] - y[0]);
  const out: Array<[number, number]> = [];
  for (const r of sorted) {
    const last = out[out.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else out.push([r[0], r[1]]);
  }
  return out;
}

export function isSlotBusy(slot: number, busy: Array<[number, number]>) {
  return busy.some(([a, b]) => slot >= a && slot < b);
}

/** Number of free slots between open and close given merged busy ranges. */
export function freeCount(busy: Array<[number, number]>, s: Settings) {
  let n = 0;
  for (let i = s.openSlot; i < s.closeSlot; i++) if (!isSlotBusy(i, busy)) n++;
  return n;
}

/** First free slot of the day, or null. */
export function firstFree(busy: Array<[number, number]>, s: Settings) {
  for (let i = s.openSlot; i < s.closeSlot; i++) if (!isSlotBusy(i, busy)) return i;
  return null;
}

/** Current quarter-hour slot of a Date (local time). */
export function slotOf(d: Date) {
  return d.getHours() * 4 + Math.floor(d.getMinutes() / 15);
}

/** Greedy column assignment for overlapping events (calendar side-by-side layout). */
export function layoutColumns<T extends { slotStart: number; slotEnd: number }>(events: T[]) {
  const sorted = [...events].sort((x, y) => x.slotStart - y.slotStart || y.slotEnd - x.slotEnd);
  const out: Array<T & { col: number; cols: number }> = [];
  let cluster: Array<T & { col: number; cols: number }> = [];
  let cols: number[] = [];
  let clusterEnd = -1;
  const flush = () => {
    const n = cols.length;
    for (const e of cluster) e.cols = n;
    cluster = [];
    cols = [];
  };
  for (const e of sorted) {
    if (cluster.length && e.slotStart >= clusterEnd) flush();
    let c = 0;
    while (cols[c] > e.slotStart) c++;
    cols[c] = e.slotEnd;
    const placed = { ...e, col: c, cols: 0 };
    cluster.push(placed);
    clusterEnd = Math.max(clusterEnd, e.slotEnd);
    out.push(placed);
  }
  flush();
  return out;
}

/** Initials for the avatar in the order modal ("Jana Nováková" -> "JN"). */
export function initials(name: string) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** "1 500 Kč", "od 500 Kč", "Domluvou" */
export function priceLabel(price: string, showCurrency = true) {
  const p = price.trim();
  if (!showCurrency) return p;
  return /^\d/.test(p) || /^od\s/i.test(p) ? `${p} Kč` : p;
}

/* ---------- services and estimates ---------- */

export type PackageLike = { name: string; price: string; showCurrency?: boolean; durationMinutes: number };

export function slotsForMinutes(minutes: number) {
  return Math.max(1, Math.ceil(minutes / 15));
}

/** Total estimated slots for the ticked package names; 0 when nothing (known) is selected. */
export function estimateSlots(selected: string[], packages: PackageLike[]) {
  let total = 0;
  for (const name of selected) {
    const pkg = packages.find((p) => p.name === name);
    if (pkg) total += slotsForMinutes(pkg.durationMinutes);
  }
  return total;
}

/** "Interiér + Tepování" */
export function servicesLabel(services: string[]) {
  return services.join(" + ");
}

/** "Interiér 1 500 Kč · Tepování od 500 Kč" — prices are listed, never summed. */
export function priceList(selected: string[], packages: PackageLike[]) {
  return selected
    .map((name) => {
      const pkg = packages.find((p) => p.name === name);
      return pkg ? `${pkg.name} ${priceLabel(pkg.price, pkg.showCurrency ?? true)}` : name;
    })
    .join(" · ");
}

/** Consecutive free slots from `start` until the next busy range or closing time. */
export function freeRunFrom(start: number, busy: Array<[number, number]>, s: Settings) {
  let n = 0;
  for (let i = start; i < s.closeSlot; i++) {
    if (isSlotBusy(i, busy)) break;
    n++;
  }
  return n;
}

/** Earliest start whose free run covers `len` slots, or null when the day cannot host them. */
export function firstStartThatFits(len: number, busy: Array<[number, number]>, s: Settings) {
  for (let i = s.openSlot; i + len <= s.closeSlot; i++) {
    if (!isSlotBusy(i, busy) && freeRunFrom(i, busy, s) >= len) return i;
  }
  return null;
}
