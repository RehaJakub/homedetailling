import { clearSessionCookieHeader, currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(request: Request) {
  const user = await currentUser(request);
  // Logging out revokes all sessions for this account, including copied tokens.
  if (user) await db.update(users).set({ sessionVersion: sql`${users.sessionVersion} + 1` }).where(eq(users.id, user.id));
  const response = Response.json({ loggedOut: true });
  response.headers.append("Set-Cookie", clearSessionCookieHeader());
  return response;
}
