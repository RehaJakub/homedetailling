import { sql } from "drizzle-orm";
import { afterAll, beforeEach } from "vitest";
import { closeDb, getDb } from "@/lib/db";

// Every test starts from empty tables. Files run sequentially
// (fileParallelism: false), so a shared TRUNCATE is safe.
beforeEach(async () => {
  await getDb().execute(sql`TRUNCATE TABLE users, reservations, price_packages, settings, login_attempts RESTART IDENTITY CASCADE`);
});

afterAll(async () => {
  await closeDb();
});
