import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pricePackages } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";
import { parsePricePackage } from "@/lib/validation";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request, ["admin", "manager"]);
  if (auth.error) return auth.error;
  const id = Number((await context.params).id);
  const parsed = parsePricePackage((await request.json()) as Record<string, unknown>);
  if (!Number.isInteger(id) || id < 1 || !parsed) return Response.json({ error: "Neplatné údaje balíčku." }, { status: 400 });
  const updated = await db.update(pricePackages).set({ ...parsed, updatedAt: new Date() }).where(eq(pricePackages.id, id)).returning();
  if (!updated.length) return Response.json({ error: "Balíček nebyl nalezen." }, { status: 404 });
  return Response.json({ package: updated[0] });
}
