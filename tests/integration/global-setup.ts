import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { TEST_DATABASE_URL } from "./env.mts";

// Runs once in the main process before any integration test file: brings the
// test database up to date with drizzle/ so the suite always sees the schema
// the app expects.
export default async function setup() {
  const pool = new Pool({ connectionString: TEST_DATABASE_URL });
  try {
    await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Integration tests need the test database at ${TEST_DATABASE_URL.replace(/:\/\/.*@/, "://***@")}. ` +
        "Start it with `make db-up` (and `make db-test-ensure` for an existing volume). " +
        `Underlying error: ${message}`,
    );
  } finally {
    await pool.end();
  }
}
