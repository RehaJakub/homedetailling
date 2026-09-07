import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword, requireUser, type Role } from "@/lib/auth";
import { validEmail } from "@/lib/validation";
import { invalidJson, readJsonObject } from "@/lib/request";

const roles: Role[] = ["admin", "manager", "viewer"];

export async function GET(request: Request) {
  const auth = await requireUser(request, ["admin"]);
  if (auth.error) return auth.error;
  const rows = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active, createdAt: users.createdAt }).from(users).orderBy(asc(users.name));
  return Response.json({ users: rows });
}

export async function POST(request: Request) {
  const auth = await requireUser(request, ["admin"]);
  if (auth.error) return auth.error;
  const body = await readJsonObject(request);
  if (!body) return invalidJson();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const role = String(body.role ?? "viewer") as Role;
  if (!name || !validEmail(email) || password.length < 10 || !roles.includes(role)) return Response.json({ error: "Neplatné údaje uživatele." }, { status: 400 });
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return Response.json({ error: "Uživatel s tímto e-mailem už existuje." }, { status: 409 });
  const [created] = await db.insert(users).values({ name, email, passwordHash: await hashPassword(password), role }).returning({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active, createdAt: users.createdAt });
  return Response.json({ user: created }, { status: 201 });
}
