import { expect, it } from "vitest";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users, loginAttempts } from "@/lib/db/schema";
import { GET as me } from "@/app/api/v2/auth/me/route";
import { POST as password } from "@/app/api/v2/auth/password/route";
import { POST as logout } from "@/app/api/v2/auth/logout/route";
import { POST as login } from "@/app/api/v2/auth/login/route";
import * as userList from "@/app/api/v2/users/route";
import * as userItem from "@/app/api/v2/users/[id]/route";
import * as pricing from "@/app/api/v2/pricing/route";
import * as priceItem from "@/app/api/v2/pricing/[id]/route";
import * as settings from "@/app/api/v2/settings/route";
import * as reservations from "@/app/api/v2/reservations/route";
import * as reservationItem from "@/app/api/v2/reservations/[id]/route";
import { allowLogin, LOGIN_ATTEMPT_LIMIT } from "@/lib/login-limit";
import { ctx, defaultPassword, futureWorkday, jsonRequest, loginAs, sessionCookieFor } from "./helpers";

it.each(["anonymous", "viewer", "manager"] as const)("access matrix: %s cannot exceed its rights", async role => {
  const cookie = role === "anonymous" ? undefined : (await loginAs(role)).cookie;
  const expected = role === "anonymous" ? 401 : 403;
  expect((await userList.GET(jsonRequest("GET", "/", undefined, cookie))).status).toBe(expected);
  expect((await userList.POST(jsonRequest("POST", "/", {}, cookie))).status).toBe(expected);
  expect((await userItem.PATCH(jsonRequest("PATCH", "/", {}, cookie), ctx(999))).status).toBe(expected);
  expect((await userItem.DELETE(jsonRequest("DELETE", "/", undefined, cookie), ctx(999))).status).toBe(expected);
  if (role === "manager") return;
  expect((await pricing.POST(jsonRequest("POST", "/", {}, cookie))).status).toBe(expected);
  expect((await priceItem.PATCH(jsonRequest("PATCH", "/", {}, cookie), ctx(999))).status).toBe(expected);
  expect((await priceItem.DELETE(jsonRequest("DELETE", "/", undefined, cookie), ctx(999))).status).toBe(expected);
  expect((await settings.PUT(jsonRequest("PUT", "/", {}, cookie))).status).toBe(expected);
  expect((await reservationItem.PATCH(jsonRequest("PATCH", "/", {}, cookie), ctx(999))).status).toBe(expected);
  expect((await reservationItem.DELETE(jsonRequest("DELETE", "/", undefined, cookie), ctx(999))).status).toBe(expected);
});

it("password change revokes existing sessions, while new login works", async () => {
  const { cookie } = await loginAs("admin");
  const result = await password(jsonRequest("POST", "/", { current: defaultPassword, next: "new-audit-password" }, cookie));
  expect(result.status).toBe(200);
  expect(result.headers.get("set-cookie")).toContain("Max-Age=0");
  expect((await me(jsonRequest("GET", "/", undefined, cookie))).status).toBe(401);
  const signedIn = await login(jsonRequest("POST", "/", { email: "admin@example.test", password: "new-audit-password" }));
  expect(signedIn.status).toBe(200);
  expect((await me(jsonRequest("GET", "/", undefined, signedIn.headers.get("set-cookie")!.split(";")[0]))).status).toBe(200);
});

it("logout revokes copied tokens from all devices", async () => {
  const { user, cookie } = await loginAs("admin");
  const other = await sessionCookieFor(user);
  expect((await logout(jsonRequest("POST", "/", undefined, cookie))).status).toBe(200);
  expect((await me(jsonRequest("GET", "/", undefined, other))).status).toBe(401);
});

it("admin reset revokes target sessions", async () => {
  const admin = await loginAs("admin");
  const target = await loginAs("manager");
  expect((await userItem.PATCH(jsonRequest("PATCH", "/", { password: "replacement-password" }, admin.cookie), ctx(target.user.id))).status).toBe(200);
  expect((await me(jsonRequest("GET", "/", undefined, target.cookie))).status).toBe(401);
});

it("deactivation followed by reactivation cannot revive old tokens", async () => {
  const admin = await loginAs("admin");
  const target = await loginAs("viewer");
  for (const active of [false, true]) expect((await userItem.PATCH(jsonRequest("PATCH", "/", { active }, admin.cookie), ctx(target.user.id))).status).toBe(200);
  expect((await me(jsonRequest("GET", "/", undefined, target.cookie))).status).toBe(401);
});

it("role change takes effect for old sessions", async () => {
  const { user, cookie } = await loginAs("admin");
  await getDb().update(users).set({ role: "viewer" }).where(eq(users.id, user.id));
  expect((await userList.GET(jsonRequest("GET", "/", undefined, cookie))).status).toBe(403);
});

it("malformed cookie is unauthenticated", async () => {
  expect((await me(jsonRequest("GET", "/", undefined, "homedetailing_session=%"))).status).toBe(401);
});

it.each(["null", "[]", "{"])("bad login JSON returns 400: %s", async body => {
  expect((await login(new Request("http://test.local", { method: "POST", body }))).status).toBe(400);
});

it("login throttle returns 429 and normalizes account names", async () => {
  for (let i = 0; i < LOGIN_ATTEMPT_LIMIT; i++) {
    expect((await login(jsonRequest("POST", "/", { email: "a@example.test", password: "wrong-password" }))).status).toBe(401);
  }
  const result = await login(jsonRequest("POST", "/", { email: " A@EXAMPLE.TEST ", password: "wrong-password" }));
  expect(result.status).toBe(429);
  expect(result.headers.get("retry-after")).toBe("900");
  expect(await allowLogin("other@example.test")).toBe(true);
});

it("login throttle is atomic under concurrency and expires", async () => {
  const results = await Promise.all(Array.from({ length: 14 }, () => allowLogin("a@example.test")));
  expect(results.filter(Boolean)).toHaveLength(LOGIN_ATTEMPT_LIMIT);
  await getDb().update(loginAttempts).set({ expiresAt: sql`now() - interval '1 second'` });
  expect(await allowLogin("a@example.test")).toBe(true);
});

const payload = () => ({ name: "Audit Test", phone: "777123456", email: "audit@example.test", services: ["Interiér"], address: "Test", date: futureWorkday(), a: 36, b: 48 });

it("accepts only one simultaneous public booking, including with an empty settings table", async () => {
  const body = payload();
  const responses = await Promise.all(Array.from({ length: 12 }, () => reservations.POST(jsonRequest("POST", "/", body))));
  expect(responses.filter(r => r.status === 201)).toHaveLength(1);
  expect(responses.filter(r => r.status === 409)).toHaveLength(11);
});

it("rejects updates crossing midnight and keeps stored booking unchanged", async () => {
  const { cookie } = await loginAs("admin");
  const created = await reservations.POST(jsonRequest("POST", "/", payload(), cookie));
  const { reservation } = await created.json();
  expect((await reservationItem.PATCH(jsonRequest("PATCH", "/", { a: 96 }, cookie), ctx(reservation.id))).status).toBe(400);
  const result = await reservations.GET(jsonRequest("GET", "/", undefined, cookie));
  expect((await result.json()).reservations[0].slotStart).toBe(36);
  expect((await reservationItem.PATCH(jsonRequest("PATCH", "/", { a: 94, b: 96 }, cookie), ctx(reservation.id))).status).toBe(200);
});
