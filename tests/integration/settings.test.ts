import { describe, expect, it } from "vitest";
import { GET, PUT } from "@/app/api/v2/settings/route";
import { POST as changePassword } from "@/app/api/v2/auth/password/route";
import { POST as login } from "@/app/api/v2/auth/login/route";
import { defaultPassword, json, jsonRequest, loginAs } from "./helpers";

const valid = { openSlot: 32, closeSlot: 76, stepMinutes: 15, bufferMinutes: 15, workDays: [1, 1, 1, 1, 1, 1, 1] };

describe("settings", () => {
  it("requires a session to read and manager rights to write", async () => {
    expect((await GET(jsonRequest("GET", "/api/v2/settings"))).status).toBe(401);
    const { cookie } = await loginAs("viewer");
    expect((await GET(jsonRequest("GET", "/api/v2/settings", undefined, cookie))).status).toBe(200);
    expect((await PUT(jsonRequest("PUT", "/api/v2/settings", valid, cookie))).status).toBe(403);
  });

  it("returns defaults before anything is saved, then the saved values", async () => {
    const { cookie } = await loginAs("manager");
    const before = await json<{ settings: typeof valid }>(await GET(jsonRequest("GET", "/api/v2/settings", undefined, cookie)));
    expect(before.settings).toMatchObject({ openSlot: 28, closeSlot: 76, bufferMinutes: 30 });
    const saved = await json<{ settings: typeof valid }>(await PUT(jsonRequest("PUT", "/api/v2/settings", valid, cookie)));
    expect(saved.settings).toEqual(valid);
    const after = await json<{ settings: typeof valid }>(await GET(jsonRequest("GET", "/api/v2/settings", undefined, cookie)));
    expect(after.settings).toEqual(valid);
  });

  it("rejects invalid settings", async () => {
    const { cookie } = await loginAs("admin");
    expect((await PUT(jsonRequest("PUT", "/api/v2/settings", { ...valid, closeSlot: 33 }, cookie))).status).toBe(400);
  });
});

describe("POST /api/v2/auth/password", () => {
  it("changes the caller's password after checking the current one", async () => {
    const { user, cookie } = await loginAs("viewer", { email: "v@example.test" });
    expect((await changePassword(jsonRequest("POST", "/api/v2/auth/password", { current: "wrong", next: "a-new-long-password" }, cookie))).status).toBe(403);
    expect((await changePassword(jsonRequest("POST", "/api/v2/auth/password", { current: defaultPassword, next: "short" }, cookie))).status).toBe(400);
    expect((await changePassword(jsonRequest("POST", "/api/v2/auth/password", { current: defaultPassword, next: "a-new-long-password" }, cookie))).status).toBe(200);
    expect((await login(jsonRequest("POST", "/api/v2/auth/login", { email: user.email, password: "a-new-long-password" }))).status).toBe(200);
  });
});
