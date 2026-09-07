import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createSessionToken, sessionCookieHeader, verifyPassword } from "@/lib/auth";
import { invalidJson, readJsonObject, rejectUnsafeMutation } from "@/lib/request";
import { allowLogin, clearLoginAttempts, LOGIN_WINDOW_SECONDS } from "@/lib/login-limit";
import { PASSWORD_MAX_LENGTH } from "@/lib/password-policy";

// Keeps password verification work comparable even when the e-mail does not exist.
const DUMMY_PASSWORD_HASH = `${"0".repeat(32)}:${"0".repeat(128)}`;

export async function POST(request: Request) {
  const rejected = rejectUnsafeMutation(request);
  if (rejected) return rejected;
  const body = await readJsonObject(request);
  if (!body) return invalidJson();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!email || email.length > 254 || !password || password.length > PASSWORD_MAX_LENGTH) return Response.json({ error: "Neplatný e-mail nebo heslo." }, { status: 400 });
  if (!await allowLogin(email)) return Response.json({ error: "Příliš mnoho pokusů. Zkuste přihlášení za 15 minut." }, { status: 429, headers: { "Retry-After": String(LOGIN_WINDOW_SECONDS) } });
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const passwordMatches = await verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
  if (!user?.active || !passwordMatches) return Response.json({ error: "Neplatný e-mail nebo heslo." }, { status: 401 });
  await clearLoginAttempts(email);
  const token = await createSessionToken(user);
  const response = Response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  response.headers.append("Set-Cookie", sessionCookieHeader(token));
  return response;
}
