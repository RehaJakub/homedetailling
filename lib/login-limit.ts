import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const LOGIN_ATTEMPT_LIMIT = 10;
export const LOGIN_WINDOW_SECONDS = 15 * 60;

/** Account-based: cannot be bypassed by forging forwarding headers or changing IP. */
export async function allowLogin(email: string) {
  const key = createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
  await db.execute(sql`DELETE FROM login_attempts WHERE expires_at < now()`);
  const result = await db.execute<{ attempts: number }>(sql`
    INSERT INTO login_attempts (key, attempts, expires_at)
    VALUES (${key}, 1, now() + interval '15 minutes')
    ON CONFLICT (key) DO UPDATE SET
      attempts = CASE WHEN login_attempts.expires_at <= now() THEN 1 ELSE login_attempts.attempts + 1 END,
      expires_at = CASE WHEN login_attempts.expires_at <= now() THEN now() + interval '15 minutes' ELSE login_attempts.expires_at END
    RETURNING attempts
  `);
  return result.rows[0].attempts <= LOGIN_ATTEMPT_LIMIT;
}
