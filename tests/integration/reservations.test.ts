import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/v2/reservations/route";
import { DELETE, PATCH } from "@/app/api/v2/reservations/[id]/route";
import { ctx, json, jsonRequest, loginAs } from "./helpers";

const valid = {
  name: "Jana Nováková",
  phone: "+420 777 123 456",
  email: "Jana@Example.test",
  service: "Interiér",
  address: "Nádražní 12, Ostrava",
  note: "Vchod ze dvora",
};

async function create(body: Record<string, unknown> = valid) {
  const response = await POST(jsonRequest("POST", "/api/v2/reservations", body));
  return { response, body: await json<{ id?: number; error?: string }>(response) };
}

describe("POST /api/v2/reservations (public)", () => {
  it("stores a valid reservation", async () => {
    const { response, body } = await create();
    expect(response.status).toBe(201);
    expect(body.id).toBe(1);
  });

  it("rejects an incomplete body", async () => {
    const { response } = await create({ ...valid, name: "Jana" });
    expect(response.status).toBe(400);
  });
});

describe("GET /api/v2/reservations", () => {
  it("requires a session", async () => {
    expect((await GET(jsonRequest("GET", "/api/v2/reservations"))).status).toBe(401);
  });

  it("lists reservations newest first for any role", async () => {
    await create({ ...valid, name: "První Zákazník" });
    await create({ ...valid, name: "Druhý Zákazník" });
    const { cookie } = await loginAs("viewer");
    const response = await GET(jsonRequest("GET", "/api/v2/reservations", undefined, cookie));
    expect(response.status).toBe(200);
    const body = await json<{ reservations: Array<{ name: string; email: string; status: string }> }>(response);
    expect(body.reservations.map((r) => r.name)).toEqual(["Druhý Zákazník", "První Zákazník"]);
    expect(body.reservations[0]).toMatchObject({ email: "jana@example.test", status: "active" });
  });
});

describe("PATCH /api/v2/reservations/[id]", () => {
  it("forbids viewers", async () => {
    await create();
    const { cookie } = await loginAs("viewer");
    const response = await PATCH(jsonRequest("PATCH", "/api/v2/reservations/1", { status: "completed" }, cookie), ctx(1));
    expect(response.status).toBe(403);
  });

  it("lets a manager complete a reservation", async () => {
    await create();
    const { cookie } = await loginAs("manager");
    const response = await PATCH(jsonRequest("PATCH", "/api/v2/reservations/1", { status: "completed" }, cookie), ctx(1));
    expect(response.status).toBe(200);
    const list = await GET(jsonRequest("GET", "/api/v2/reservations", undefined, cookie));
    const body = await json<{ reservations: Array<{ status: string }> }>(list);
    expect(body.reservations[0].status).toBe("completed");
  });

  it("validates status and id", async () => {
    await create();
    const { cookie } = await loginAs("admin");
    expect((await PATCH(jsonRequest("PATCH", "/api/v2/reservations/1", { status: "done" }, cookie), ctx(1))).status).toBe(400);
    expect((await PATCH(jsonRequest("PATCH", "/api/v2/reservations/x", { status: "active" }, cookie), ctx("x"))).status).toBe(400);
    expect((await PATCH(jsonRequest("PATCH", "/api/v2/reservations/99", { status: "active" }, cookie), ctx(99))).status).toBe(404);
  });
});

describe("DELETE /api/v2/reservations/[id]", () => {
  it("deletes once and then reports not found", async () => {
    await create();
    const { cookie } = await loginAs("manager");
    expect((await DELETE(jsonRequest("DELETE", "/api/v2/reservations/1", undefined, cookie), ctx(1))).status).toBe(200);
    expect((await DELETE(jsonRequest("DELETE", "/api/v2/reservations/1", undefined, cookie), ctx(1))).status).toBe(404);
  });

  it("requires a session", async () => {
    expect((await DELETE(jsonRequest("DELETE", "/api/v2/reservations/1"), ctx(1))).status).toBe(401);
  });
});
