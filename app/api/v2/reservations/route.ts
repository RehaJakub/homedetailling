import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { reservations } from "@/lib/db/schema";
import { currentUser, requireUser } from "@/lib/auth";
import { busyRanges, isSlotBusy, isWorkDay } from "@/lib/booking";
import { businessNow, getSettings } from "@/lib/settings";
import { bookingStatuses, parseReservation } from "@/lib/validation";
import type { BookingStatus } from "@/lib/booking";

export async function GET(request: Request) {
  const auth = await requireUser(request, ["admin", "manager", "viewer"]);
  if (auth.error) return auth.error;
  const rows = await db.select().from(reservations).orderBy(asc(reservations.date), asc(reservations.slotStart), asc(reservations.id));
  return Response.json({ reservations: rows });
}

/**
 * Public booking from the website (status `new`, must fit a free slot) or,
 * for a signed-in admin/manager, an order created by phone (any status,
 * overlaps allowed and shown in the calendar).
 */
export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const parsed = parseReservation(body);
  if (!parsed) return Response.json({ error: "Zkontrolujte povinné údaje rezervace." }, { status: 400 });

  const staff = await currentUser(request);
  const isStaff = staff !== null && (staff.role === "admin" || staff.role === "manager");
  const settings = await getSettings();

  let status: BookingStatus = "new";
  if (isStaff) {
    if (body.status !== undefined) {
      if (!bookingStatuses.includes(body.status as BookingStatus)) return Response.json({ error: "Neplatný stav." }, { status: 400 });
      status = body.status as BookingStatus;
    }
  } else {
    const now = businessNow();
    if (parsed.date < now.iso || !isWorkDay(parsed.date, settings)) return Response.json({ error: "V tento den nejezdíme. Vyberte prosím jiný." }, { status: 409 });
    if (parsed.slotStart < settings.openSlot || parsed.slotEnd > settings.closeSlot) return Response.json({ error: "Čas je mimo provozní dobu." }, { status: 409 });
    const rows = await db
      .select({ id: reservations.id, date: reservations.date, slotStart: reservations.slotStart, slotEnd: reservations.slotEnd, status: reservations.status })
      .from(reservations)
      .where(eq(reservations.date, parsed.date));
    const busy = busyRanges(parsed.date, rows, settings, parsed.date === now.iso ? now.slot : undefined);
    for (let i = parsed.slotStart; i < parsed.slotEnd; i++) {
      if (isSlotBusy(i, busy)) return Response.json({ error: "Vybraný čas už je obsazený. Zvolte prosím jiný." }, { status: 409 });
    }
  }

  const [created] = await db.insert(reservations).values({ ...parsed, status }).returning();
  return Response.json(isStaff ? { reservation: created } : { id: created.id }, { status: 201 });
}
