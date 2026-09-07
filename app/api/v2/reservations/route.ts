import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { reservations } from "@/lib/db/schema";
import { currentUser, requireUser } from "@/lib/auth";
import { busyRanges, isSlotBusy, isWorkDay, settingsForDate, PUBLIC_BOOKING_STEP_SLOTS, PUBLIC_BOOKING_DURATION_SLOTS, publicBookingSettings } from "@/lib/booking";
import { businessNow, getSettings } from "@/lib/settings";
import { bookingStatuses, parseReservation } from "@/lib/validation";
import type { BookingStatus } from "@/lib/booking";
import { invalidJson, readJsonObject, rejectUnsafeMutation } from "@/lib/request";
import { allowPublicBooking, PUBLIC_BOOKING_WINDOW_SECONDS } from "@/lib/booking-limit";

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
  const rejected = rejectUnsafeMutation(request);
  if (rejected) return rejected;
  const body = await readJsonObject(request);
  if (!body) return invalidJson();
  const staff = await currentUser(request);
  const isStaff = staff !== null && (staff.role === "admin" || staff.role === "manager");
  const parsed = parseReservation(!isStaff && body.slotEnd === undefined && body.b === undefined
    ? { ...body, slotEnd: Number(body.slotStart ?? body.a) + PUBLIC_BOOKING_DURATION_SLOTS }
    : body);
  if (!parsed) return Response.json({ error: "Zkontrolujte povinné údaje rezervace." }, { status: 400 });
  if (!isStaff && parsed.slotEnd - parsed.slotStart !== PUBLIC_BOOKING_DURATION_SLOTS) {
    return Response.json({ error: "Rezervace blokuje přesně 3 hodiny. Vyberte pouze čas začátku." }, { status: 400 });
  }
  return db.transaction(async tx => {
    // Serialize availability-check + insert; also blocks concurrent staff writes.
    // Plain SELECTs remain available while this short transaction holds the lock.
    await tx.execute(sql`LOCK TABLE reservations IN SHARE ROW EXCLUSIVE MODE`);
    const settings = publicBookingSettings(await getSettings(tx));

    let status: BookingStatus = "new";
    if (isStaff) {
      if (body.status !== undefined) {
        if (!bookingStatuses.includes(body.status as BookingStatus)) return Response.json({ error: "Neplatný stav." }, { status: 400 });
        status = body.status as BookingStatus;
      }
    } else {
      if (parsed.slotStart % PUBLIC_BOOKING_STEP_SLOTS !== 0 || parsed.slotEnd % PUBLIC_BOOKING_STEP_SLOTS !== 0) {
        return Response.json({ error: "Začátek i konec rezervace vybírejte po 30 minutách." }, { status: 400 });
      }
      const now = businessNow();
      if (parsed.date < now.iso || !isWorkDay(parsed.date, settings)) return Response.json({ error: "V tento den nejezdíme. Vyberte prosím jiný." }, { status: 409 });
      const hours = settingsForDate(parsed.date, settings);
      if (parsed.slotStart < hours.openSlot || parsed.slotEnd > hours.closeSlot) return Response.json({ error: "Čas je mimo provozní dobu." }, { status: 409 });
      const rows = await tx
        .select({ id: reservations.id, date: reservations.date, slotStart: reservations.slotStart, slotEnd: reservations.slotEnd, status: reservations.status })
        .from(reservations)
        .where(eq(reservations.date, parsed.date));
      const busy = busyRanges(parsed.date, rows, settings, parsed.date === now.iso ? now.slot : undefined);
      for (let i = parsed.slotStart; i < parsed.slotEnd; i++) {
        if (isSlotBusy(i, busy)) return Response.json({ error: "Vybraný čas už je obsazený. Zvolte prosím jiný." }, { status: 409 });
      }
      if (!await allowPublicBooking(tx, parsed.email, parsed.phone)) {
        return Response.json(
          { error: "Odeslali jste příliš mnoho rezervací. Zkuste to prosím později." },
          { status: 429, headers: { "Retry-After": String(PUBLIC_BOOKING_WINDOW_SECONDS) } },
        );
      }
    }

    const [created] = await tx.insert(reservations).values({ ...parsed, status }).returning();
    return Response.json(isStaff ? { reservation: created } : { id: created.id }, { status: 201 });
  });
}
