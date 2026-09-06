import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { defaultSettings, type Settings } from "@/lib/booking";

const ROW_ID = 1;

/** Business timezone; the server may run in UTC inside Docker. */
export const BUSINESS_TZ = "Europe/Prague";

/** Reads the single settings row, creating it with defaults on first use. */
export async function getSettings(): Promise<Settings> {
  const [row] = await db.select().from(settings).where(eq(settings.id, ROW_ID)).limit(1);
  if (row) return pick(row);
  const [created] = await db.insert(settings).values({ id: ROW_ID }).onConflictDoNothing().returning();
  return created ? pick(created) : defaultSettings;
}

export async function saveSettings(next: Settings): Promise<Settings> {
  const [row] = await db
    .insert(settings)
    .values({ id: ROW_ID, ...next, weeklyHours: next.weeklyHours ?? null })
    .onConflictDoUpdate({ target: settings.id, set: { ...next, weeklyHours: next.weeklyHours ?? null, updatedAt: new Date() } })
    .returning();
  return pick(row);
}

function pick(row: typeof settings.$inferSelect): Settings {
  return { openSlot: row.openSlot, closeSlot: row.closeSlot, workDays: row.workDays, stepMinutes: row.stepMinutes, bufferMinutes: row.bufferMinutes, ...(row.weeklyHours ? { weeklyHours: row.weeklyHours } : {}) };
}

/** Today's ISO date and current quarter-hour slot in the business timezone. */
export function businessNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return {
    iso: `${get("year")}-${get("month")}-${get("day")}`,
    slot: Number(get("hour")) * 4 + Math.floor(Number(get("minute")) / 15),
  };
}
