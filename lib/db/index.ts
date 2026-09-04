import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalDatabase = globalThis as typeof globalThis & { postgresPool?: Pool };

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not configured.");

export const pool = globalDatabase.postgresPool ?? new Pool({ connectionString });
if (process.env.NODE_ENV !== "production") globalDatabase.postgresPool = pool;

export const db = drizzle(pool, { schema });
