import { and, count, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword, requireUser, type Role } from "@/lib/auth";
import { validEmail } from "@/lib/validation";

const roles: Role[] = ["admin", "manager", "viewer"];

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return auth.error;
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Neplatné ID uživatele." }, { status: 400 });
  const body = (await request.json()) as Record<string, unknown>;
  const [target] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!target) return Response.json({ error: "Uživatel nebyl nalezen." }, { status: 404 });
  const role = body.role === undefined ? target.role : String(body.role) as Role;
  const active = body.active === undefined ? target.active : body.active === true;
  if (!roles.includes(role)) return Response.json({ error: "Neplatná role." }, { status: 400 });
  if (id === auth.user.id && (!active || role !== "admin")) return Response.json({ error: "Vlastní admin účet nelze deaktivovat ani snížit jeho roli." }, { status: 409 });
  if (target.role === "admin" && (role !== "admin" || !active)) {
    const [{ value }] = await db.select({ value: count() }).from(users).where(and(eq(users.role, "admin"), eq(users.active, true), ne(users.id, id)));
    if (value === 0) return Response.json({ error: "Posledního aktivního admina nelze změnit." }, { status: 409 });
  }
  const name = body.name === undefined ? target.name : String(body.name).trim();
  const email = body.email === undefined ? target.email : String(body.email).trim().toLowerCase();
  if (!name || !validEmail(email)) return Response.json({ error: "Neplatné jméno nebo e-mail." }, { status: 400 });
  const changes: typeof users.$inferInsert = { name, email, role, active, updatedAt: new Date(), passwordHash: target.passwordHash };
  if (body.password !== undefined) {
    const password = String(body.password);
    if (password.length < 10) return Response.json({ error: "Heslo musí mít alespoň 10 znaků." }, { status: 400 });
    changes.passwordHash = await hashPassword(password);
  }
  const [updated] = await db.update(users).set(changes).where(eq(users.id, id)).returning({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active, createdAt: users.createdAt });
  return Response.json({ user: updated });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return auth.error;
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Neplatné ID uživatele." }, { status: 400 });
  if (id === auth.user.id) return Response.json({ error: "Vlastní účet nelze smazat." }, { status: 409 });
  const [target] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!target) return Response.json({ error: "Uživatel nebyl nalezen." }, { status: 404 });
  if (target.role === "admin" && target.active) {
    const [{ value }] = await db.select({ value: count() }).from(users).where(and(eq(users.role, "admin"), eq(users.active, true), ne(users.id, id)));
    if (value === 0) return Response.json({ error: "Posledního aktivního admina nelze smazat." }, { status: 409 });
  }
  await db.delete(users).where(eq(users.id, id));
  return Response.json({ deleted: true });
}
