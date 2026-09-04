import { eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { pricePackages } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";
import { parsePricePackage } from "@/lib/validation";

function validId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request, ["admin", "manager"]);
  if (auth.error) return auth.error;
  const id = validId((await context.params).id);
  const parsed = parsePricePackage((await request.json()) as Record<string, unknown>);
  if (!id || !parsed) return Response.json({ error: "Neplatné údaje balíčku." }, { status: 400 });
  const updated = await db.update(pricePackages).set({ ...parsed, updatedAt: new Date() }).where(eq(pricePackages.id, id)).returning();
  if (!updated.length) return Response.json({ error: "Balíček nebyl nalezen." }, { status: 404 });
  if (parsed.featured) await db.update(pricePackages).set({ featured: false }).where(ne(pricePackages.id, id));
  return Response.json({ package: updated[0] });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request, ["admin", "manager"]);
  if (auth.error) return auth.error;
  const id = validId((await context.params).id);
  if (!id) return Response.json({ error: "Neplatné ID balíčku." }, { status: 400 });
  const deleted = await db.delete(pricePackages).where(eq(pricePackages.id, id)).returning();
  if (!deleted.length) return Response.json({ error: "Balíček nebyl nalezen." }, { status: 404 });
  return Response.json({ deleted: true, package: deleted[0] });
}
