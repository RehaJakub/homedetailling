import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword, requireUser, verifyPassword } from "@/lib/auth";

/** Lets the signed-in user change their own password. */
export async function POST(request: Request) {
  const auth = await requireUser(request, ["admin", "manager", "viewer"]);
  if (auth.error) return auth.error;
  const body = (await request.json()) as Record<string, unknown>;
  const current = String(body.current ?? "");
  const next = String(body.next ?? "");
  if (next.length < 10) return Response.json({ error: "Nové heslo musí mít alespoň 10 znaků." }, { status: 400 });
  const [user] = await db.select().from(users).where(eq(users.id, auth.user.id)).limit(1);
  if (!user || !(await verifyPassword(current, user.passwordHash))) return Response.json({ error: "Současné heslo nesouhlasí." }, { status: 403 });
  await db.update(users).set({ passwordHash: await hashPassword(next), updatedAt: new Date() }).where(eq(users.id, user.id));
  return Response.json({ changed: true });
}
