import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createSessionToken, sessionCookieName, sessionCookieOptions, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user?.active || !(await verifyPassword(password, user.passwordHash))) return Response.json({ error: "Neplatný e-mail nebo heslo." }, { status: 401 });
  const token = await createSessionToken(user);
  const response = Response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  response.headers.append("Set-Cookie", `${sessionCookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionCookieOptions.maxAge}${sessionCookieOptions.secure ? "; Secure" : ""}`);
  return response;
}
