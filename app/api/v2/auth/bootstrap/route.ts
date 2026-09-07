import { count, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createSessionToken, hashPassword, sessionCookieHeader } from "@/lib/auth";
import { validEmail } from "@/lib/validation";
import { invalidJson, readJsonObject, rejectUnsafeMutation } from "@/lib/request";
import { validNewPassword } from "@/lib/password-policy";

export async function GET() {
  const [{ value }] = await db.select({ value: count() }).from(users);
  return Response.json({ available: value === 0 });
}

export async function POST(request: Request) {
  const rejected = rejectUnsafeMutation(request);
  if (rejected) return rejected;
  const body = await readJsonObject(request);
  if (!body) return invalidJson();
  const code = String(body.code ?? "");
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const expectedCode = process.env.ADMIN_REGISTRATION_CODE;

  // Once initialized, never reveal whether a submitted registration code is valid.
  const [{ value: existingUsers }] = await db.select({ value: count() }).from(users);
  if (existingUsers > 0) return Response.json({ error: "Počáteční registrace už byla uzavřena." }, { status: 409 });
  if (!expectedCode || code !== expectedCode) return Response.json({ error: "Neplatný registrační kód." }, { status: 403 });
  if (!name || !validEmail(email) || !validNewPassword(password)) return Response.json({ error: "Zadejte jméno, platný e-mail a heslo o délce 15 až 128 znaků." }, { status: 400 });

  const passwordHash = await hashPassword(password);
  const user = await db.transaction(async tx => {
    // Prevent two simultaneous first-admin requests from both succeeding.
    await tx.execute(sql`LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE`);
    const [{ value }] = await tx.select({ value: count() }).from(users);
    if (value > 0) return null;
    const [created] = await tx.insert(users).values({ name, email, passwordHash, role: "admin" }).returning();
    return created;
  });
  if (!user) return Response.json({ error: "Počáteční registrace už byla uzavřena." }, { status: 409 });
  const token = await createSessionToken(user);
  const response = Response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
  response.headers.append("Set-Cookie", sessionCookieHeader(token));
  return response;
}
