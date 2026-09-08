// Fills the LOCAL database with dummy data for development. Run with
// `make seed` (= `bun run db:seed`); Bun loads .env, resolves the `@/` alias
// and runs TypeScript directly. Refuses to touch anything that is not
// localhost unless --force is passed. Wipes users, reservations, packages
// and settings first.
import { sql } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import { addDays, toIso, weekdayIndex } from "@/lib/booking";
import { closeDb, getDb } from "@/lib/db";
import { pricePackages, reservations, settings, users } from "@/lib/db/schema";

const url = process.env.DATABASE_URL ?? "";
const force = process.argv.includes("--force");
if (!url) throw new Error("DATABASE_URL is required.");
if (!force && !/@(localhost|127\.0\.0\.1|postgres)[:/]/.test(url)) {
  throw new Error("Refusing to seed a non-local database. Pass --force if you really mean it.");
}
if (process.env.NODE_ENV === "production" && !force) throw new Error("Refusing to seed in production.");

const db = getDb();
const today = toIso(new Date());
/** ISO date `offset` days from today, skipping Sundays forward. */
const day = (offset: number) => {
  let iso = addDays(today, offset);
  while (weekdayIndex(iso) === 6) iso = addDays(iso, 1);
  return iso;
};

await db.execute(sql`TRUNCATE TABLE users, reservations, price_packages, settings RESTART IDENTITY CASCADE`);

await db.insert(settings).values({ id: 1, openSlot: 28, closeSlot: 76, workDays: [1, 1, 1, 1, 1, 1, 0], stepMinutes: 15, bufferMinutes: 30 });

await db.insert(users).values([
  { name: "Admin", email: "admin@admin.cz", passwordHash: await hashPassword("admin"), role: "admin" },
  { name: "Marek Vlk", email: "marek@homedetailing.cz", passwordHash: await hashPassword("manager"), role: "manager" },
  { name: "Petra Čtenářka", email: "petra@homedetailing.cz", passwordHash: await hashPassword("viewer"), role: "viewer" },
]);

await db.insert(pricePackages).values([
  { name: "Exteriér", price: "Domluvou", showCurrency: false, featured: false, durationMinutes: 180, sortOrder: 1, items: ["Ruční mytí karoserie", "Čištění kol a pneu", "Ochranný vosk na několik týdnů"] },
  { name: "Basic interiér", price: "1 500", showCurrency: true, featured: false, durationMinutes: 150, sortOrder: 2, items: ["Vysávání", "Čištění plastů, kůže a textilu", "Vnitřní okna", "Impregnace kůže a plastů", "Čištění koberců"] },
  { name: "Premium interiér", price: "2 000", showCurrency: true, featured: true, durationMinutes: 240, sortOrder: 3, items: ["Vše z balíčku Basic", "Čištění a impregnace kožených sedaček", "Tepování sedaček a koberce"] },
]);

type Row = typeof reservations.$inferInsert;
const r = (offset: number, a: number, b: number, name: string, phone: string, email: string, services: string[], address: string, status: Row["status"], note = ""): Row => ({
  name,
  phone,
  email,
  services,
  address,
  note,
  date: day(offset),
  slotStart: a,
  slotEnd: b,
  status,
});

await db.insert(reservations).values([
  // last week, finished
  r(-6, 36, 46, "Jana Nováková", "+420 777 123 456", "jana@priklad.cz", ["Tepování"], "Nádražní 12, Ostrava", "done"),
  r(-4, 32, 44, "Petr Dvořák", "+420 602 987 654", "petr@priklad.cz", ["Interiér"], "Hlavní třída 8, Ostrava-Poruba", "done"),
  r(-2, 40, 52, "Lucie Malá", "+420 731 555 210", "lucie.mala@priklad.cz", ["Exteriér"], "Sokolská 21, Ostrava", "done"),
  r(-1, 36, 40, "Jan Kovář", "+420 605 112 334", "kovar.jan@priklad.cz", ["Tepování"], "Výškovická 90, Ostrava-Zábřeh", "cancelled", "Zrušeno klientem"),
  // today
  r(0, 32, 44, "Petr Dvořák", "+420 602 987 654", "petr@priklad.cz", ["Interiér"], "Hlavní třída 8, Ostrava-Poruba", "confirmed"),
  r(0, 52, 60, "Lucie Malá", "+420 731 555 210", "lucie.mala@priklad.cz", ["Tepování"], "Sokolská 21, Ostrava", "confirmed"),
  // this week, with an overlap pair
  r(1, 40, 56, "Martin Sýkora", "+420 724 900 311", "sykora@priklad.cz", ["Exteriér"], "Frýdecká 118, Ostrava-Kunčice", "confirmed"),
  r(2, 36, 48, "Jana Nováková", "+420 777 123 456", "jana@priklad.cz", ["Interiér"], "Nádražní 12, Ostrava", "confirmed", "Vchod ze dvora"),
  r(2, 44, 52, "Tomáš Horák", "+420 608 442 118", "horak.t@priklad.cz", ["Tepování"], "Opavská 6, Ostrava-Poruba", "new", "Jen zadní sedačky"),
  r(3, 32, 44, "Eva Černá", "+420 603 210 987", "eva.cerna@priklad.cz", ["Interiér"], "Dr. Martínka 4, Ostrava-Hrabůvka", "confirmed"),
  r(3, 56, 70, "Alena Procházková", "+420 605 778 990", "alena.p@priklad.cz", ["Exteriér", "Tepování"], "Horní 55, Ostrava-Dubina", "confirmed"),
  r(4, 36, 48, "Radek Beneš", "+420 737 121 212", "benes@priklad.cz", ["Interiér", "Tepování"], "Mírová 3, Havířov", "new", "Odhad služeb 4 h, zákazník rezervoval 3 h – nemusíme vše stihnout, domluvit postup."),
  // next week
  r(7, 36, 42, "Michal Urban", "+420 602 445 667", "urban.m@priklad.cz", ["Tepování"], "Beskydská 14, Frýdek-Místek", "new"),
  r(8, 48, 60, "Petra Nová", "+420 731 888 001", "petra.nova@priklad.cz", ["Interiér"], "Hlučínská 7, Ostrava-Přívoz", "new"),
  r(9, 32, 48, "Ondřej Kolář", "+420 604 556 778", "kolar@priklad.cz", ["Exteriér"], "Porubská 40, Ostrava-Poruba", "confirmed"),
  r(10, 40, 46, "Karel Novotný", "+420 776 334 556", "novotny.k@priklad.cz", ["Tepování"], "28. října 150, Ostrava", "new", "Dodávka, 3 řady sedadel"),
  r(11, 36, 52, "Jana Nováková", "+420 777 123 456", "jana@priklad.cz", ["Exteriér", "Interiér"], "Nádražní 12, Ostrava", "confirmed"),
]);

const [{ count }] = (await db.execute(sql`SELECT count(*)::int AS count FROM reservations`)).rows as Array<{ count: number }>;
console.log(`Seeded 3 users, 3 packages, settings and ${count} reservations.`);
console.log("Sign in at /admin/login: admin@admin.cz / admin (also marek@homedetailing.cz / manager, petra@homedetailing.cz / viewer).");
await closeDb();
