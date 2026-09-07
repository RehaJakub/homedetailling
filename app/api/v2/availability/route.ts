import { and, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { reservations } from "@/lib/db/schema";
import { addDays, busyRanges, fromIso, isIsoDate, isWorkDay, publicBookingSettings } from "@/lib/booking";
import { businessNow, getSettings } from "@/lib/settings";

const MAX_DAYS = 92;

/**
 * Public availability for the booking calendar.
 * `?date=YYYY-MM-DD` or `?from=YYYY-MM-DD&to=YYYY-MM-DD` (inclusive, max 92 days).
 * Returns opening settings and, per day, whether it is closed and which slot
 * ranges are busy (active bookings without an extra buffer, plus the past today).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const single = url.searchParams.get("date");
  const from = single ?? url.searchParams.get("from");
  const to = single ?? url.searchParams.get("to") ?? from;
  if (!isIsoDate(from) || !isIsoDate(to) || to < from) return Response.json({ error: "Neplatné datum." }, { status: 400 });
  const span = Math.round((fromIso(to).getTime() - fromIso(from).getTime()) / 86_400_000) + 1;
  if (span > MAX_DAYS) return Response.json({ error: `Rozsah může mít nejvýše ${MAX_DAYS} dní.` }, { status: 400 });

  const settings = publicBookingSettings(await getSettings());
  const rows = await db
    .select({ id: reservations.id, date: reservations.date, slotStart: reservations.slotStart, slotEnd: reservations.slotEnd, status: reservations.status })
    .from(reservations)
    .where(and(gte(reservations.date, from), lte(reservations.date, to)));
  const now = businessNow();

  const days: Record<string, { closed: boolean; busy: Array<[number, number]> }> = {};
  for (let iso = from; iso <= to; iso = addDays(iso, 1)) {
    if (!isWorkDay(iso, settings) || iso < now.iso) {
      days[iso] = { closed: true, busy: [] };
      continue;
    }
    days[iso] = { closed: false, busy: busyRanges(iso, rows, settings, iso === now.iso ? now.slot : undefined) };
  }
  return Response.json({ settings, today: now.iso, days }, { headers: { "cache-control": "no-store" } });
}

export const dynamic = "force-dynamic";
