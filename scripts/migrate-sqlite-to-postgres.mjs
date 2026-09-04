import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";
import pg from "pg";

const sqlitePath = new URL("../data/reservations.sqlite", import.meta.url);
if (!existsSync(sqlitePath)) throw new Error("SQLite database was not found in data/reservations.sqlite.");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

const sqlite = new DatabaseSync(sqlitePath, { readOnly: true });
const postgres = new pg.Client({ connectionString: process.env.DATABASE_URL });
await postgres.connect();

try {
  await postgres.query("BEGIN");
  const reservations = sqlite.prepare("SELECT * FROM reservations ORDER BY id").all();
  const packages = sqlite.prepare("SELECT * FROM price_packages ORDER BY sort_order, id").all();

  for (const row of reservations) {
    await postgres.query(
      `INSERT INTO reservations (id, name, phone, email, service, address, note, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO NOTHING`,
      [row.id, row.name, row.phone, row.email ?? "", row.service, row.address ?? "", row.note ?? "", row.status === "hotová" ? "completed" : "active", row.created_at],
    );
  }

  for (const row of packages) {
    await postgres.query(
      `INSERT INTO price_packages (id, name, price, show_currency, items, sort_order)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, price=EXCLUDED.price, show_currency=EXCLUDED.show_currency, items=EXCLUDED.items, sort_order=EXCLUDED.sort_order`,
      [row.id, row.name, row.price, Boolean(row.show_currency), row.items, row.sort_order],
    );
  }

  await postgres.query("SELECT setval(pg_get_serial_sequence('reservations','id'), GREATEST(COALESCE((SELECT MAX(id) FROM reservations), 1), 1))");
  await postgres.query("SELECT setval(pg_get_serial_sequence('price_packages','id'), GREATEST(COALESCE((SELECT MAX(id) FROM price_packages), 1), 1))");
  await postgres.query("COMMIT");
  console.log(`Migrated ${reservations.length} reservations and ${packages.length} price packages.`);
} catch (error) {
  await postgres.query("ROLLBACK");
  throw error;
} finally {
  await postgres.end();
  sqlite.close();
}
