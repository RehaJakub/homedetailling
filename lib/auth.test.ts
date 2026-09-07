import { afterEach, describe, expect, it } from "vitest";
import { SignJWT } from "jose";
import {
  clearSessionCookieHeader,
  createSessionToken,
  hashPassword,
  readCookie,
  sessionCookieHeader,
  sessionCookieName,
  verifyPassword,
  verifySessionToken,
} from "./auth";

const secret = "unit-test-secret-".padEnd(40, "x");
process.env.JWT_SECRET = secret;

afterEach(() => {
  process.env.JWT_SECRET = secret;
});

describe("hashPassword / verifyPassword", () => {
  it("stores salt and hash and verifies the original password", async () => {
    const stored = await hashPassword("hunter2hunter2");
    expect(stored).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/);
    expect(await verifyPassword("hunter2hunter2", stored)).toBe(true);
  });

  it("salts every hash differently", async () => {
    expect(await hashPassword("same")).not.toBe(await hashPassword("same"));
  });

  it("rejects a wrong password and malformed stored values", async () => {
    const stored = await hashPassword("right");
    expect(await verifyPassword("wrong", stored)).toBe(false);
    expect(await verifyPassword("right", "not-a-hash")).toBe(false);
    expect(await verifyPassword("right", "")).toBe(false);
  });
});

describe("session tokens", () => {
  it("round-trips id and role", async () => {
    const token = await createSessionToken({ id: 7, role: "manager" });
    expect(await verifySessionToken(token)).toEqual({ id: 7, role: "manager", version: 0 });
  });

  it("rejects expired tokens", async () => {
    const token = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("1")
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(new TextEncoder().encode(secret));
    expect(await verifySessionToken(token)).toBeNull();
  });

  it("rejects tokens signed with another secret", async () => {
    const token = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("1")
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("another-secret-that-is-long-enough-too"));
    expect(await verifySessionToken(token)).toBeNull();
  });

  it("rejects garbage, non-integer subjects and unknown roles", async () => {
    expect(await verifySessionToken("not.a.jwt")).toBeNull();
    const key = new TextEncoder().encode(secret);
    const badSubject = await new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" }).setSubject("abc").setExpirationTime("1h").sign(key);
    expect(await verifySessionToken(badSubject)).toBeNull();
    const badRole = await new SignJWT({ role: "root" }).setProtectedHeader({ alg: "HS256" }).setSubject("1").setExpirationTime("1h").sign(key);
    expect(await verifySessionToken(badRole)).toBeNull();
  });

  it("refuses to sign with a short JWT_SECRET", async () => {
    process.env.JWT_SECRET = "too-short";
    await expect(createSessionToken({ id: 1, role: "admin" })).rejects.toThrow(/32 characters/);
  });
});

describe("cookies", () => {
  it("reads a cookie among several, decoding its value", () => {
    const request = new Request("http://test.local/", {
      headers: { cookie: `theme=dark; ${sessionCookieName}=a%3Db%3Dc; other=1` },
    });
    expect(readCookie(request, sessionCookieName)).toBe("a=b=c");
    expect(readCookie(request, "theme")).toBe("dark");
    expect(readCookie(request, "missing")).toBeUndefined();
  });

  it("returns undefined without a cookie header", () => {
    expect(readCookie(new Request("http://test.local/"), sessionCookieName)).toBeUndefined();
  });

  it("builds set and clear headers", () => {
    expect(sessionCookieHeader("tok")).toMatch(new RegExp(`^${sessionCookieName}=tok; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800`));
    expect(clearSessionCookieHeader()).toBe(`${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  });
});
