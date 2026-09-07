import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createSessionToken, sessionCookieHeader, verifyPassword } from "@/lib/auth";
import { invalidJson, readJsonObject } from "@/lib/request";
import { allowLogin, LOGIN_WINDOW_SECONDS } from "@/lib/login-limit";

export async function POST(request: Request) {
  const body = await readJsonObject(request);
  if (!body) return invalidJson();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!email || email.length > 254 || !password || password.length > 1024) return Response.json({ error: "Neplatný e-mail nebo heslo." }, { status: 400 });
  if (!await allowLogin(email)) return Response.json({ error: "Příliš mnoho pokusů. Zkuste přihlášení za 15 minut." }, { status: 429, headers: { "Retry-After": String(LOGIN_WINDOW_SECONDS) } });
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user?.active || !(await verifyPassword(password, user.passwordHash))) return Response.json({ error: "Neplatný e-mail nebo heslo." }, { status: 401 });
  const token = await createSessionToken(user);
  const response = Response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  response.headers.append("Set-Cookie", sessionCookieHeader(token));
  return response;
}
