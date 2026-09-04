import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { reservations } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";
import { parseReservation } from "@/lib/validation";

export async function GET(request: Request) {
  const auth = await requireUser(request, ["admin", "manager", "viewer"]);
  if (auth.error) return auth.error;
  return Response.json({ reservations: await db.select().from(reservations).orderBy(desc(reservations.createdAt), desc(reservations.id)) });
}

export async function POST(request: Request) {
  const parsed = parseReservation((await request.json()) as Record<string, unknown>);
  if (!parsed) return Response.json({ error: "Zkontrolujte povinné údaje rezervace." }, { status: 400 });
  const [reservation] = await db.insert(reservations).values(parsed).returning({ id: reservations.id });
  return Response.json({ id: reservation.id }, { status: 201 });
}
