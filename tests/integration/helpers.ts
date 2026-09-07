import { createSessionToken, hashPassword, sessionCookieName, type Role } from "@/lib/auth";
import { addDays, weekdayIndex } from "@/lib/booking";
import { businessNow } from "@/lib/settings";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";

const origin = "http://test.local";

/** Builds a Request the way Next hands it to a route handler. */
export function jsonRequest(method: string, path: string, body?: unknown, cookie?: string) {
  const headers: Record<string, string> = {};
  headers["x-requested-with"] = "XMLHttpRequest";
  headers.origin = origin;
  if (body !== undefined) headers["content-type"] = "application/json";
  if (cookie) headers.cookie = cookie;
  return new Request(origin + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/** Dynamic-route context; Next 16 passes params as a Promise. */
export function ctx(id: number | string) {
  return { params: Promise.resolve({ id: String(id) }) };
}

export const defaultPassword = "correct-horse-battery";

type UserInput = { role: Role; name?: string; email?: string; active?: boolean; password?: string };

export async function createUser(input: UserInput) {
  const [user] = await getDb()
    .insert(users)
    .values({
      name: input.name ?? `${input.role} user`,
      email: input.email ?? `${input.role}@example.test`,
      role: input.role,
      active: input.active ?? true,
      passwordHash: await hashPassword(input.password ?? defaultPassword),
    })
    .returning();
  return user;
}

export async function sessionCookieFor(user: { id: number; role: Role }) {
  return `${sessionCookieName}=${await createSessionToken(user)}`;
}

/** Creates a user and returns the cookie header that authenticates as them. */
export async function loginAs(role: Role, overrides: Omit<UserInput, "role"> = {}) {
  const user = await createUser({ role, ...overrides });
  return { user, cookie: await sessionCookieFor(user) };
}

export async function json<T = Record<string, unknown>>(response: Response) {
  return (await response.json()) as T;
}

/** A working day (Mon–Sat) at least `offset` days ahead, so public booking checks never hit "past" or "closed". */
export function futureWorkday(offset = 7) {
  let iso = addDays(businessNow().iso, offset);
  while (weekdayIndex(iso) === 6) iso = addDays(iso, 1);
  return iso;
}
