import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { clearSessionCookieHeader, hashPassword, requireUser, verifyPassword } from "@/lib/auth";
import { invalidJson, readJsonObject, rejectUnsafeMutation } from "@/lib/request";
import { validNewPassword } from "@/lib/password-policy";

/** Lets the signed-in user change their own password. */
export async function POST(request: Request) {
  const rejected = rejectUnsafeMutation(request);
  if (rejected) return rejected;
  const auth = await requireUser(request, ["admin", "manager", "viewer"]);
  if (auth.error) return auth.error;
  const body = await readJsonObject(request);
  if (!body) return invalidJson();
  const current = String(body.current ?? "");
  const next = String(body.next ?? "");
  if (!validNewPassword(next)) return Response.json({ error: "Nové heslo musí mít 15 až 128 znaků." }, { status: 400 });
  const [user] = await db.select().from(users).where(eq(users.id, auth.user.id)).limit(1);
  if (!user || !(await verifyPassword(current, user.passwordHash))) return Response.json({ error: "Současné heslo nesouhlasí." }, { status: 403 });
  await db.update(users).set({ passwordHash: await hashPassword(next), sessionVersion: sql`${users.sessionVersion} + 1`, updatedAt: new Date() }).where(eq(users.id, user.id));
  return Response.json({ changed: true }, { headers: { "Set-Cookie": clearSessionCookieHeader() } });
}
