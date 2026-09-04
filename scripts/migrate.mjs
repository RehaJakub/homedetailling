// Applies pending migrations from ./drizzle using drizzle-orm's programmatic
// migrator. Used by the `migrate` service in compose.prod.yml (the runtime
// image has no drizzle-kit) and usable locally: `node scripts/migrate.mjs`.
// Shares the `drizzle.__drizzle_migrations` table with `drizzle-kit migrate`.
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");

const pool = new pg.Pool({ connectionString });
try {
  await migrate(drizzle(pool), { migrationsFolder: new URL("../drizzle", import.meta.url).pathname });
  console.log("migrations applied");
} finally {
  await pool.end();
}
