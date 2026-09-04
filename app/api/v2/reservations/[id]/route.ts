import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { reservations } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";
import { parseReservationPatch } from "@/lib/validation";

function validId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request, ["admin", "manager"]);
  if (auth.error) return auth.error;
  const id = validId((await context.params).id);
  if (!id) return Response.json({ error: "Neplatné ID rezervace." }, { status: 400 });
  const patch = parseReservationPatch((await request.json()) as Record<string, unknown>);
  if (!patch) return Response.json({ error: "Neplatné údaje rezervace." }, { status: 400 });

  const [current] = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
  if (!current) return Response.json({ error: "Rezervace nebyla nalezena." }, { status: 404 });
  const slotStart = patch.slotStart ?? current.slotStart;
  let slotEnd = patch.slotEnd ?? current.slotEnd;
  if (slotEnd <= slotStart) slotEnd = slotStart + 1;

  const [updated] = await db
    .update(reservations)
    .set({ ...patch, slotStart, slotEnd, updatedAt: new Date() })
    .where(eq(reservations.id, id))
    .returning();
  return Response.json({ reservation: updated });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request, ["admin", "manager"]);
  if (auth.error) return auth.error;
  const id = validId((await context.params).id);
  if (!id) return Response.json({ error: "Neplatné ID rezervace." }, { status: 400 });
  const deleted = await db.delete(reservations).where(eq(reservations.id, id)).returning();
  if (!deleted.length) return Response.json({ error: "Rezervace nebyla nalezena." }, { status: 404 });
  return Response.json({ deleted: true, reservation: deleted[0] });
}
