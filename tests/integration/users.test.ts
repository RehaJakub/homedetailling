import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/v2/users/route";
import { DELETE, PATCH } from "@/app/api/v2/users/[id]/route";
import { POST as login } from "@/app/api/v2/auth/login/route";
import { createUser, defaultPassword, json, jsonRequest, loginAs } from "./helpers";

type User = { id: number; name: string; email: string; role: string; active: boolean };

const newUser = { name: "Petr Dvořák", email: "Petr@Example.test", password: "petr-secret-password", role: "manager" };

describe("GET /api/v2/users", () => {
  it("is admin-only", async () => {
    const { cookie } = await loginAs("manager");
    expect((await GET(jsonRequest("GET", "/api/v2/users", undefined, cookie))).status).toBe(403);
  });

  it("lists users without password hashes", async () => {
    const { cookie } = await loginAs("admin", { name: "Zuzana" });
    await createUser({ role: "viewer", name: "Adam", email: "adam@example.test" });
    const response = await GET(jsonRequest("GET", "/api/v2/users", undefined, cookie));
    expect(response.status).toBe(200);
    const body = await json<{ users: User[] }>(response);
    expect(body.users.map((u) => u.name)).toEqual(["Adam", "Zuzana"]);
    for (const user of body.users) expect(user).not.toHaveProperty("passwordHash");
  });
});

describe("POST /api/v2/users", () => {
  it("creates a user whose credentials work for login", async () => {
    const { cookie } = await loginAs("admin");
    const response = await POST(jsonRequest("POST", "/api/v2/users", newUser, cookie));
    expect(response.status).toBe(201);
    expect((await json<{ user: User }>(response)).user).toMatchObject({ email: "petr@example.test", role: "manager", active: true });
    const session = await login(jsonRequest("POST", "/api/v2/auth/login", { email: newUser.email, password: newUser.password }));
    expect(session.status).toBe(200);
  });

  it("rejects duplicates and bad roles", async () => {
    const { cookie } = await loginAs("admin");
    await POST(jsonRequest("POST", "/api/v2/users", newUser, cookie));
    expect((await POST(jsonRequest("POST", "/api/v2/users", newUser, cookie))).status).toBe(409);
    expect((await POST(jsonRequest("POST", "/api/v2/users", { ...newUser, email: "x@example.test", role: "root" }, cookie))).status).toBe(400);
  });
});

describe("PATCH /api/v2/users/[id]", () => {
  it("refuses to demote or deactivate the caller", async () => {
    const { user, cookie } = await loginAs("admin");
    expect((await PATCH(jsonRequest("PATCH", `/api/v2/users/${user.id}`, { role: "viewer" }, cookie), ctxOf(user.id))).status).toBe(409);
    expect((await PATCH(jsonRequest("PATCH", `/api/v2/users/${user.id}`, { active: false }, cookie), ctxOf(user.id))).status).toBe(409);
  });

  it("lets an admin demote or deactivate another admin", async () => {
    const { cookie } = await loginAs("admin");
    const other = await createUser({ role: "admin", email: "second@example.test" });
    const demoted = await PATCH(jsonRequest("PATCH", `/api/v2/users/${other.id}`, { role: "manager" }, cookie), ctxOf(other.id));
    expect(demoted.status).toBe(200);
    expect((await json<{ user: User }>(demoted)).user).toMatchObject({ role: "manager", active: true });
    const deactivated = await PATCH(jsonRequest("PATCH", `/api/v2/users/${other.id}`, { active: false }, cookie), ctxOf(other.id));
    expect((await json<{ user: User }>(deactivated)).user.active).toBe(false);
  });

  it("changes the password so the new one logs in", async () => {
    const { cookie } = await loginAs("admin");
    const target = await createUser({ role: "viewer", email: "v@example.test" });
    const response = await PATCH(jsonRequest("PATCH", `/api/v2/users/${target.id}`, { password: "brand-new-password" }, cookie), ctxOf(target.id));
    expect(response.status).toBe(200);
    expect((await login(jsonRequest("POST", "/api/v2/auth/login", { email: "v@example.test", password: defaultPassword }))).status).toBe(401);
    expect((await login(jsonRequest("POST", "/api/v2/auth/login", { email: "v@example.test", password: "brand-new-password" }))).status).toBe(200);
  });

  it("validates input", async () => {
    const { cookie } = await loginAs("admin");
    const target = await createUser({ role: "viewer", email: "v@example.test" });
    expect((await PATCH(jsonRequest("PATCH", `/api/v2/users/${target.id}`, { password: "short" }, cookie), ctxOf(target.id))).status).toBe(400);
    expect((await PATCH(jsonRequest("PATCH", `/api/v2/users/${target.id}`, { email: "not-an-email" }, cookie), ctxOf(target.id))).status).toBe(400);
    expect((await PATCH(jsonRequest("PATCH", "/api/v2/users/999", { name: "X" }, cookie), ctxOf(999))).status).toBe(404);
  });
});

describe("DELETE /api/v2/users/[id]", () => {
  it("refuses self-deletion but allows deleting another admin", async () => {
    const { user, cookie } = await loginAs("admin");
    expect((await DELETE(jsonRequest("DELETE", `/api/v2/users/${user.id}`, undefined, cookie), ctxOf(user.id))).status).toBe(409);
    const other = await createUser({ role: "admin", email: "second@example.test" });
    expect((await DELETE(jsonRequest("DELETE", `/api/v2/users/${other.id}`, undefined, cookie), ctxOf(other.id))).status).toBe(200);
  });

  it("deletes other users", async () => {
    const { cookie } = await loginAs("admin");
    const target = await createUser({ role: "viewer", email: "gone@example.test" });
    expect((await DELETE(jsonRequest("DELETE", `/api/v2/users/${target.id}`, undefined, cookie), ctxOf(target.id))).status).toBe(200);
    expect((await DELETE(jsonRequest("DELETE", `/api/v2/users/${target.id}`, undefined, cookie), ctxOf(target.id))).status).toBe(404);
  });
});

function ctxOf(id: number) {
  return { params: Promise.resolve({ id: String(id) }) };
}
