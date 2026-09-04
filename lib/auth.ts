import { promisify } from "node:util";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { jwtVerify, SignJWT } from "jose";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const scrypt = promisify(scryptCallback);
export const sessionCookieName = "homedetailing_session";
export type Role = "admin" | "manager" | "viewer";
export const roles: Role[] = ["admin", "manager", "viewer"];

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_SECRET must contain at least 32 characters.");
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

export async function createSessionToken(user: { id: number; role: Role }) {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(jwtSecret());
}

export async function verifySessionToken(token: string): Promise<{ id: number; role: Role } | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    const id = Number(payload.sub);
    if (!Number.isInteger(id) || id < 1) return null;
    if (typeof payload.role !== "string" || !roles.includes(payload.role as Role)) return null;
    return { id, role: payload.role as Role };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 8,
};

/** `Set-Cookie` header value that stores the session token. */
export function sessionCookieHeader(token: string) {
  const { maxAge, secure } = sessionCookieOptions;
  return `${sessionCookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}

/** `Set-Cookie` header value that clears the session cookie. */
export function clearSessionCookieHeader() {
  return `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function readCookie(request: Request, name: string) {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export async function currentUser(request: Request) {
  const token = readCookie(request, sessionCookieName);
  if (!token) return null;
  const session = await verifySessionToken(token);
  if (!session) return null;
  const [user] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
  if (!user?.active) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function requireUser(request: Request, allowed: Role[]) {
  const user = await currentUser(request);
  if (!user) return { error: Response.json({ error: "Přihlášení je vyžadováno." }, { status: 401 }) };
  if (!allowed.includes(user.role)) return { error: Response.json({ error: "Nemáte oprávnění k této akci." }, { status: 403 }) };
  return { user };
}
