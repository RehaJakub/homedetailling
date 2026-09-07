import { asc, max, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { pricePackages } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";
import { parsePricePackage } from "@/lib/validation";
import { invalidJson, readJsonObject } from "@/lib/request";

export async function GET() {
  return Response.json({ packages: await db.select().from(pricePackages).orderBy(asc(pricePackages.sortOrder), asc(pricePackages.id)) });
}

export async function POST(request: Request) {
  const auth = await requireUser(request, ["admin", "manager"]);
  if (auth.error) return auth.error;
  const body = await readJsonObject(request);
  if (!body) return invalidJson();
  const parsed = parsePricePackage(body);
  if (!parsed) return Response.json({ error: "Vyplňte název, cenu a alespoň jeden popisek." }, { status: 400 });
  const [row] = await db.select({ value: max(pricePackages.sortOrder) }).from(pricePackages);
  const [created] = await db.insert(pricePackages).values({ ...parsed, sortOrder: (row.value ?? 0) + 1 }).returning();
  // Only one package carries the "Nejoblíbenější" badge.
  if (created.featured) await db.update(pricePackages).set({ featured: false }).where(ne(pricePackages.id, created.id));
  return Response.json({ package: created }, { status: 201 });
}
