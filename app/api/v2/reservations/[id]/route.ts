import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { reservations } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";

function validId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(["admin", "manager"]);
  if (auth.error) return auth.error;
  const id = validId((await context.params).id);
  if (!id) return Response.json({ error: "Neplatné ID rezervace." }, { status: 400 });
  const body = (await request.json()) as Record<string, unknown>;
  if (body.status !== "completed" && body.status !== "active") return Response.json({ error: "Neplatný stav rezervace." }, { status: 400 });
  const updated = await db.update(reservations).set({ status: body.status }).where(eq(reservations.id, id)).returning({ id: reservations.id });
  if (!updated.length) return Response.json({ error: "Rezervace nebyla nalezena." }, { status: 404 });
  return Response.json({ reservation: updated[0] });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(["admin", "manager"]);
  if (auth.error) return auth.error;
  const id = validId((await context.params).id);
  if (!id) return Response.json({ error: "Neplatné ID rezervace." }, { status: 400 });
  const deleted = await db.delete(reservations).where(eq(reservations.id, id)).returning({ id: reservations.id });
  if (!deleted.length) return Response.json({ error: "Rezervace nebyla nalezena." }, { status: 404 });
  return Response.json({ deleted: true });
}
