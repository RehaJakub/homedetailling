import { isIsoDate, SLOTS_PER_DAY, type BookingStatus } from "@/lib/booking";

export const bookingStatuses: BookingStatus[] = ["new", "confirmed", "done", "cancelled"];

function text(value: unknown) {
  return String(value ?? "").trim();
}

function slot(value: unknown) {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= SLOTS_PER_DAY ? n : null;
}

/**
 * Contact + slot payload of a reservation. `slotStart`/`slotEnd` are
 * quarter-hour indices with `slotEnd` exclusive (also accepted as `a`/`b`).
 */
export function parseReservation(body: Record<string, unknown>) {
  const name = text(body.name);
  const phone = text(body.phone);
  const email = text(body.email).toLowerCase();
  const service = text(body.service);
  const address = text(body.address);
  const note = text(body.note);
  if (!name || !phone || !email || !service || !address) return null;
  if (name.split(/\s+/).length < 2 || phone.replace(/\D/g, "").length < 9) return null;
  if (!validEmail(email)) return null;
  const when = parseSlotRange(body);
  if (!when) return null;
  return {
    name: name.slice(0, 120),
    phone: phone.slice(0, 40),
    email: email.slice(0, 254),
    service: service.slice(0, 80),
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
  const strings: Array<[string, number]> = [["name", 120], ["phone", 40], ["email", 254], ["service", 80], ["address", 240], ["note", 1000]];
  for (const [key, max] of strings) {
    if (body[key] === undefined) continue;
    const value = text(body[key]).slice(0, max);
    if (key !== "note" && !value) return null;
    if (key === "email" && !validEmail(value)) return null;
    if (key === "name" && value.split(/\s+/).length < 2) return null;
    patch[key] = key === "email" ? value.toLowerCase() : value;
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
    service: string;
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
  return {
    name: name.slice(0, 80),
    price: price.slice(0, 30),
    showCurrency: body.showCurrency !== false,
    featured: body.featured === true,
    items: items.slice(0, 12),
  };
}

export function parseSettings(body: Record<string, unknown>) {
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
