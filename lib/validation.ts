import { isIsoDate, SLOTS_PER_DAY, type BookingStatus, type DayHours } from "@/lib/booking";
import { isInteriorTier } from "@/lib/service-selection";

export const bookingStatuses: BookingStatus[] = ["new", "confirmed", "done", "cancelled"];

function text(value: unknown) {
  return String(value ?? "").trim();
}

function slot(value: unknown) {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= SLOTS_PER_DAY ? n : null;
}

/**
 * Ticked package names: `services` (array) or the legacy single `service`
 * string. Trimmed, de-duplicated, at most 12 × 80 chars; `null` when empty.
 */
export function parseServices(body: Record<string, unknown>) {
  const raw = Array.isArray(body.services) ? body.services : body.service !== undefined ? [body.service] : [];
  const services = [...new Set(raw.map((v) => text(v).slice(0, 80)).filter(Boolean))].slice(0, 12);
  if (services.filter(isInteriorTier).length > 1) return null;
  return services.length ? services : null;
}

/**
 * Contact + slot payload of a reservation. `slotStart`/`slotEnd` are
 * quarter-hour indices with `slotEnd` exclusive (also accepted as `a`/`b`).
 */
export function parseReservation(body: Record<string, unknown>) {
  const name = text(body.name);
  const phone = text(body.phone);
  const email = text(body.email).toLowerCase();
  const services = parseServices(body);
  const address = text(body.address);
  const note = text(body.note);
  if (!name || !phone || !email || !services || !address) return null;
  if (name.split(/\s+/).length < 2 || phone.replace(/\D/g, "").length < 9) return null;
  if (!validEmail(email)) return null;
  const when = parseSlotRange(body);
  if (!when) return null;
  return {
    name: name.slice(0, 120),
    phone: phone.slice(0, 40),
    email: email.slice(0, 254),
    services,
    address: address.slice(0, 240),
    note: note.slice(0, 1000),
    ...when,
  };
}

/** `{ date, slotStart, slotEnd }` from a body using either the long or the `a`/`b` names. */
export function parseSlotRange(body: Record<string, unknown>) {
  const date = body.date;
  const slotStart = slot(body.slotStart ?? body.a);
  const slotEnd = slot(body.slotEnd ?? body.b);
  if (!isIsoDate(date) || slotStart === null || slotEnd === null || slotEnd <= slotStart) return null;
  return { date, slotStart, slotEnd };
}

/**
 * Partial update from the admin: every field optional, validated when present.
 * Returns `null` when a present field is invalid.
 */
export function parseReservationPatch(body: Record<string, unknown>) {
  const patch: Record<string, unknown> = {};
  const strings: Array<[string, number]> = [["name", 120], ["phone", 40], ["email", 254], ["address", 240], ["note", 1000]];
  for (const [key, max] of strings) {
    if (body[key] === undefined) continue;
    const value = text(body[key]).slice(0, max);
    if (key !== "note" && !value) return null;
    if (key === "email" && !validEmail(value)) return null;
    if (key === "name" && value.split(/\s+/).length < 2) return null;
    patch[key] = key === "email" ? value.toLowerCase() : value;
  }
  if (body.services !== undefined || body.service !== undefined) {
    const services = parseServices(body);
    if (!services) return null;
    patch.services = services;
  }
  if (body.status !== undefined) {
    if (!bookingStatuses.includes(body.status as BookingStatus)) return null;
    patch.status = body.status;
  }
  if (body.date !== undefined) {
    if (!isIsoDate(body.date)) return null;
    patch.date = body.date;
  }
  if (body.slotStart !== undefined || body.a !== undefined) {
    const v = slot(body.slotStart ?? body.a);
    if (v === null) return null;
    patch.slotStart = v;
  }
  if (body.slotEnd !== undefined || body.b !== undefined) {
    const v = slot(body.slotEnd ?? body.b);
    if (v === null) return null;
    patch.slotEnd = v;
  }
  return patch as Partial<{
    name: string;
    phone: string;
    email: string;
    services: string[];
    address: string;
    note: string;
    status: BookingStatus;
    date: string;
    slotStart: number;
    slotEnd: number;
  }>;
}

export function parsePricePackage(body: Record<string, unknown>) {
  const name = text(body.name);
  const price = text(body.price);
  const items = Array.isArray(body.items) ? body.items.map(String).map((item) => item.trim()).filter(Boolean) : [];
  if (!name || !price || items.length === 0) return null;
  const durationMinutes = body.durationMinutes === undefined ? 120 : Number(body.durationMinutes);
  if (!Number.isInteger(durationMinutes) || durationMinutes < 15 || durationMinutes > 720 || durationMinutes % 15 !== 0) return null;
  return {
    name: name.slice(0, 80),
    price: price.slice(0, 30),
    showCurrency: body.showCurrency !== false,
    featured: body.featured === true,
    durationMinutes,
    items: items.slice(0, 12),
  };
}

export function parseSettings(body: Record<string, unknown>) {
  if (body.weeklyHours !== undefined) {
    if (!Array.isArray(body.weeklyHours) || body.weeklyHours.length !== 7) return null;
    const weeklyHours: Array<DayHours | null> = [];
    for (const day of body.weeklyHours) {
      if (day === null) { weeklyHours.push(null); continue; }
      if (typeof day !== "object" || Array.isArray(day)) return null;
      const openSlot = slot(day.openSlot);
      const closeSlot = slot(day.closeSlot);
      if (openSlot === null || closeSlot === null || closeSlot - openSlot < 2 || openSlot % 2 || closeSlot % 2) return null;
      weeklyHours.push({ openSlot, closeSlot });
    }
    const stepMinutes = Number(body.stepMinutes);
    const bufferMinutes = Number(body.bufferMinutes);
    if (![15, 30, 60].includes(stepMinutes) || ![0, 15, 30, 45].includes(bufferMinutes)) return null;
    const openDays = weeklyHours.filter((d): d is DayHours => d !== null);
    return {
      weeklyHours, workDays: weeklyHours.map(d => d ? 1 : 0),
      openSlot: openDays.length ? Math.min(...openDays.map(d => d.openSlot)) : 28,
      closeSlot: openDays.length ? Math.max(...openDays.map(d => d.closeSlot)) : 76,
      stepMinutes, bufferMinutes,
    };
  }
  const openSlot = slot(body.openSlot);
  const closeSlot = slot(body.closeSlot);
  const stepMinutes = Number(body.stepMinutes);
  const bufferMinutes = Number(body.bufferMinutes);
  const workDays = Array.isArray(body.workDays) ? body.workDays.map((d) => (d ? 1 : 0)) : null;
  if (openSlot === null || closeSlot === null || closeSlot - openSlot < 4) return null;
  if (![15, 30, 60].includes(stepMinutes)) return null;
  if (![0, 15, 30, 45].includes(bufferMinutes)) return null;
  if (!workDays || workDays.length !== 7 || !workDays.some(Boolean)) return null;
  return { openSlot, closeSlot, stepMinutes, bufferMinutes, workDays };
}

export function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
