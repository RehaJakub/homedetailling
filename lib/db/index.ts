import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

// The pool is created on first use, not at import time, so route modules can be
// imported (by `next build` page-data collection and by unit tests) without a
// DATABASE_URL. Outside production the pool is kept on globalThis to survive
// dev-server module reloads.
const globalDatabase = globalThis as typeof globalThis & { postgresPool?: Pool };

let instance: Database | undefined;
let pool: Pool | undefined;

function create(): Database {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");
  pool = globalDatabase.postgresPool ?? new Pool({ connectionString });
  if (process.env.NODE_ENV !== "production") globalDatabase.postgresPool = pool;
  return drizzle(pool, { schema });
}

export function getDb(): Database {
  return (instance ??= create());
}

export async function closeDb() {
  await pool?.end();
  pool = instance = globalDatabase.postgresPool = undefined;
}

// Lazy facade over getDb() so callers can keep writing `db.select()...`.
export const db: Database = new Proxy({} as Database, {
  get(_target, prop) {
    const real = getDb();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
