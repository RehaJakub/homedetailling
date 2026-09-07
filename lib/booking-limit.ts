import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const PUBLIC_BOOKING_LIMIT = 4;
export const PUBLIC_BOOKING_WINDOW_SECONDS = 60 * 60;

/** Persistent contact-based spam limit shared by every application instance. */
export async function allowPublicBooking(
  connection: Pick<typeof db, "execute">,
  email: string,
  phone: string,
) {
  const normalized = `${email.trim().toLowerCase()}\n${phone.replace(/\D/g, "")}`;
  const key = `booking:${createHash("sha256").update(normalized).digest("hex")}`;
  const result = await connection.execute<{ attempts: number }>(sql`
    INSERT INTO login_attempts (key, attempts, expires_at)
    VALUES (${key}, 1, now() + interval '1 hour')
    ON CONFLICT (key) DO UPDATE SET
      attempts = CASE WHEN login_attempts.expires_at <= now() THEN 1 ELSE login_attempts.attempts + 1 END,
      expires_at = CASE WHEN login_attempts.expires_at <= now() THEN now() + interval '1 hour' ELSE login_attempts.expires_at END
    RETURNING attempts
  `);
  return result.rows[0].attempts <= PUBLIC_BOOKING_LIMIT;
}
