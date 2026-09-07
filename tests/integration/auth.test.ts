import { describe, expect, it } from "vitest";
import { GET as bootstrapGet, POST as bootstrapPost } from "@/app/api/v2/auth/bootstrap/route";
import { POST as login } from "@/app/api/v2/auth/login/route";
import { POST as logout } from "@/app/api/v2/auth/logout/route";
import { GET as me } from "@/app/api/v2/auth/me/route";
import { sessionCookieName } from "@/lib/auth";
import { TEST_REGISTRATION_CODE } from "./env.mts";
import { createUser, defaultPassword, json, jsonRequest, loginAs } from "./helpers";

const firstAdmin = { code: TEST_REGISTRATION_CODE, name: "Ondřej Admin", email: "Admin@Example.test", password: "first-admin-password" };

describe("bootstrap", () => {
  it("is available only while no user exists", async () => {
    expect(await json(await bootstrapGet())).toEqual({ available: true });
    await createUser({ role: "viewer" });
    expect(await json(await bootstrapGet())).toEqual({ available: false });
  });

  it("rejects a wrong registration code", async () => {
    const response = await bootstrapPost(jsonRequest("POST", "/api/v2/auth/bootstrap", { ...firstAdmin, code: "nope" }));
    expect(response.status).toBe(403);
  });

  it("rejects a short password", async () => {
    const response = await bootstrapPost(jsonRequest("POST", "/api/v2/auth/bootstrap", { ...firstAdmin, password: "short" }));
    expect(response.status).toBe(400);
  });

  it("creates the first admin, sets the session cookie and then closes", async () => {
    const response = await bootstrapPost(jsonRequest("POST", "/api/v2/auth/bootstrap", firstAdmin));
    expect(response.status).toBe(201);
    expect(response.headers.get("set-cookie")).toMatch(new RegExp(`^${sessionCookieName}=[^;]+; Path=/; HttpOnly`));
    const body = await json<{ user: { email: string; role: string } }>(response);
    expect(body.user).toMatchObject({ email: "admin@example.test", role: "admin" });

    const again = await bootstrapPost(jsonRequest("POST", "/api/v2/auth/bootstrap", firstAdmin));
    expect(again.status).toBe(409);
  });

  it("creates only one first admin under concurrent requests", async () => {
    const responses = await Promise.all([
      bootstrapPost(jsonRequest("POST", "/api/v2/auth/bootstrap", firstAdmin)),
      bootstrapPost(jsonRequest("POST", "/api/v2/auth/bootstrap", { ...firstAdmin, email: "second@example.test" })),
    ]);
    expect(responses.map(response => response.status).sort()).toEqual([201, 409]);
  });
});

describe("login", () => {
  it("rejects a wrong password", async () => {
    await createUser({ role: "admin", email: "a@example.test" });
    const response = await login(jsonRequest("POST", "/api/v2/auth/login", { email: "a@example.test", password: "wrong-password" }));
    expect(response.status).toBe(401);
  });

  it("rejects an inactive user", async () => {
    await createUser({ role: "admin", email: "a@example.test", active: false });
    const response = await login(jsonRequest("POST", "/api/v2/auth/login", { email: "a@example.test", password: defaultPassword }));
    expect(response.status).toBe(401);
  });

  it("returns the user and a session cookie on success", async () => {
    const user = await createUser({ role: "manager", email: "m@example.test" });
    const response = await login(jsonRequest("POST", "/api/v2/auth/login", { email: " M@Example.test ", password: defaultPassword }));
    expect(response.status).toBe(200);
    const body = await json<{ user: Record<string, unknown> }>(response);
    expect(body.user).toEqual({ id: user.id, name: user.name, email: user.email, role: "manager" });
    expect(body.user).not.toHaveProperty("passwordHash");
    expect(response.headers.get("set-cookie")).toContain(`${sessionCookieName}=`);
  });

  it("clears failed-attempt accounting after each successful login", async () => {
    await createUser({ role: "admin", email: "a@example.test" });
    for (let i = 0; i < 12; i++) {
      const response = await login(jsonRequest("POST", "/api/v2/auth/login", { email: "a@example.test", password: defaultPassword }));
      expect(response.status).toBe(200);
    }
  });
});

describe("me / logout", () => {
  it("requires a session", async () => {
    expect((await me(jsonRequest("GET", "/api/v2/auth/me"))).status).toBe(401);
  });

  it("returns the current user without secrets", async () => {
    const { user, cookie } = await loginAs("viewer");
    const response = await me(jsonRequest("GET", "/api/v2/auth/me", undefined, cookie));
    expect(response.status).toBe(200);
    expect(await json(response)).toEqual({ user: { id: user.id, name: user.name, email: user.email, role: "viewer" } });
  });

  it("rejects a session whose user was deactivated", async () => {
    const { cookie } = await loginAs("viewer", { active: false });
    expect((await me(jsonRequest("GET", "/api/v2/auth/me", undefined, cookie))).status).toBe(401);
  });

  it("clears the cookie on logout", async () => {
    const response = await logout(jsonRequest("POST", "/api/v2/auth/logout"));
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});
