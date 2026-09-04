import { count } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createSessionToken, hashPassword, sessionCookieHeader } from "@/lib/auth";
import { validEmail } from "@/lib/validation";

export async function GET() {
  const [{ value }] = await db.select({ value: count() }).from(users);
  return Response.json({ available: value === 0 });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const code = String(body.code ?? "");
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const expectedCode = process.env.ADMIN_REGISTRATION_CODE;

  const [{ value }] = await db.select({ value: count() }).from(users);
  if (value > 0) return Response.json({ error: "Počáteční registrace už byla uzavřena." }, { status: 409 });
  if (!expectedCode || code !== expectedCode) return Response.json({ error: "Neplatný registrační kód." }, { status: 403 });
  if (!name || !validEmail(email) || password.length < 10) return Response.json({ error: "Zadejte jméno, platný e-mail a heslo s alespoň 10 znaky." }, { status: 400 });

  const [user] = await db.insert(users).values({ name, email, passwordHash: await hashPassword(password), role: "admin" }).returning();
  const token = await createSessionToken(user);
  const response = Response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
  response.headers.append("Set-Cookie", sessionCookieHeader(token));
  return response;
}
