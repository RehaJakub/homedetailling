import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/v2/reservations/route";
import { DELETE, PATCH } from "@/app/api/v2/reservations/[id]/route";
import { addDays, weekdayIndex } from "@/lib/booking";
import { businessNow } from "@/lib/settings";
import { ctx, futureWorkday, json, jsonRequest, loginAs } from "./helpers";

type Reservation = { id: number; name: string; email: string; services: string[]; date: string; slotStart: number; slotEnd: number; status: string };

const day = futureWorkday();
const valid = {
  name: "Jana Nováková",
  phone: "+420 777 123 456",
  email: "Jana@Example.test",
  services: ["Interiér", "Tepování"],
  address: "Nádražní 12, Ostrava",
  note: "Vchod ze dvora",
  date: day,
  a: 36,
  b: 48,
};

async function create(body: Record<string, unknown> = valid, cookie?: string) {
  const response = await POST(jsonRequest("POST", "/api/v2/reservations", body, cookie));
  return { response, body: await json<{ id?: number; reservation?: Reservation; error?: string }>(response) };
}

describe("POST /api/v2/reservations (public)", () => {
  it("stores a valid reservation as new", async () => {
    const { response, body } = await create();
    expect(response.status).toBe(201);
    expect(body.id).toBe(1);
    const { cookie } = await loginAs("viewer");
    const list = await json<{ reservations: Reservation[] }>(await GET(jsonRequest("GET", "/api/v2/reservations", undefined, cookie)));
    expect(list.reservations[0]).toMatchObject({ date: day, slotStart: 36, slotEnd: 48, status: "new", email: "jana@example.test", services: ["Interiér", "Tepování"] });
  });

  it("accepts the legacy single service field and rejects an empty list", async () => {
    const legacy: Record<string, unknown> = { ...valid, services: undefined, service: "Exteriér" };
    const { response, body } = await create(legacy);
    expect(response.status).toBe(201);
    const { cookie } = await loginAs("viewer");
    const list = await json<{ reservations: Reservation[] }>(await GET(jsonRequest("GET", "/api/v2/reservations", undefined, cookie)));
    expect(list.reservations.find((x) => x.id === body.id)?.services).toEqual(["Exteriér"]);
    expect((await create({ ...valid, services: [] })).response.status).toBe(400);
  });

  it("rejects an incomplete body", async () => {
    expect((await create({ ...valid, name: "Jana" })).response.status).toBe(400);
    expect((await create({ ...valid, a: 40, b: 40 })).response.status).toBe(400);
  });

  it("rejects closed days, times outside opening hours and the past", async () => {
    let sunday = day;
    while (weekdayIndex(sunday) !== 6) sunday = addDays(sunday, 1);
    expect((await create({ ...valid, date: sunday })).response.status).toBe(409);
    expect((await create({ ...valid, a: 20, b: 24 })).response.status).toBe(409);
    expect((await create({ ...valid, date: addDays(businessNow().iso, -1) })).response.status).toBe(409);
  });

  it("rejects overlaps and the buffer around an active booking", async () => {
    await create();
    expect((await create({ ...valid, a: 44, b: 52 })).response.status).toBe(409);
    // 30 min buffer = 2 slots after 12:00 → 12:00–12:30 is blocked, 12:30 is free
    expect((await create({ ...valid, a: 48, b: 52 })).response.status).toBe(409);
    expect((await create({ ...valid, a: 50, b: 56 })).response.status).toBe(201);
  });

  it("ignores cancelled bookings when checking availability", async () => {
    const { cookie } = await loginAs("manager");
    await create({ ...valid, status: "cancelled" }, cookie);
    expect((await create()).response.status).toBe(201);
  });
});

describe("POST /api/v2/reservations (staff)", () => {
  it("lets a manager create an order with a status and overlapping time", async () => {
    const { cookie } = await loginAs("manager");
    const first = await create({ ...valid, status: "confirmed" }, cookie);
    expect(first.response.status).toBe(201);
    expect(first.body.reservation).toMatchObject({ status: "confirmed", slotStart: 36 });
    const second = await create({ ...valid, name: "Petr Dvořák", a: 40, b: 44, status: "confirmed" }, cookie);
    expect(second.response.status).toBe(201);
  });

  it("rejects an unknown status", async () => {
    const { cookie } = await loginAs("admin");
    expect((await create({ ...valid, status: "later" }, cookie)).response.status).toBe(400);
  });
});

describe("GET /api/v2/reservations", () => {
  it("requires a session", async () => {
    expect((await GET(jsonRequest("GET", "/api/v2/reservations"))).status).toBe(401);
  });

  it("lists reservations by date and start slot for any role", async () => {
    await create({ ...valid, name: "Druhý Zákazník", date: addDays(day, 1) });
    await create({ ...valid, name: "První Zákazník" });
    const { cookie } = await loginAs("viewer");
    const response = await GET(jsonRequest("GET", "/api/v2/reservations", undefined, cookie));
    expect(response.status).toBe(200);
    const body = await json<{ reservations: Reservation[] }>(response);
    expect(body.reservations.map((r) => r.name)).toEqual(["První Zákazník", "Druhý Zákazník"]);
  });
});

describe("PATCH /api/v2/reservations/[id]", () => {
  it("forbids viewers", async () => {
    await create();
    const { cookie } = await loginAs("viewer");
    expect((await PATCH(jsonRequest("PATCH", "/api/v2/reservations/1", { status: "confirmed" }, cookie), ctx(1))).status).toBe(403);
  });

  it("lets a manager confirm, move and finish a booking", async () => {
    await create();
    const { cookie } = await loginAs("manager");
    const confirmed = await PATCH(jsonRequest("PATCH", "/api/v2/reservations/1", { status: "confirmed", a: 40, b: 52, note: "Přesunuto", services: ["Interiér"] }, cookie), ctx(1));
    expect(confirmed.status).toBe(200);
    expect((await json<{ reservation: Reservation }>(confirmed)).reservation).toMatchObject({ status: "confirmed", slotStart: 40, slotEnd: 52, services: ["Interiér"] });
    const done = await PATCH(jsonRequest("PATCH", "/api/v2/reservations/1", { status: "done" }, cookie), ctx(1));
    expect((await json<{ reservation: Reservation }>(done)).reservation.status).toBe("done");
  });

  it("keeps the end after the start", async () => {
    await create();
    const { cookie } = await loginAs("admin");
    const moved = await PATCH(jsonRequest("PATCH", "/api/v2/reservations/1", { a: 50 }, cookie), ctx(1));
    expect((await json<{ reservation: Reservation }>(moved)).reservation).toMatchObject({ slotStart: 50, slotEnd: 51 });
  });

  it("validates status and id", async () => {
    await create();
    const { cookie } = await loginAs("admin");
    expect((await PATCH(jsonRequest("PATCH", "/api/v2/reservations/1", { status: "completed" }, cookie), ctx(1))).status).toBe(400);
    expect((await PATCH(jsonRequest("PATCH", "/api/v2/reservations/x", { status: "new" }, cookie), ctx("x"))).status).toBe(400);
    expect((await PATCH(jsonRequest("PATCH", "/api/v2/reservations/99", { status: "new" }, cookie), ctx(99))).status).toBe(404);
  });
});

describe("DELETE /api/v2/reservations/[id]", () => {
  it("deletes once, returns the row for undo, then reports not found", async () => {
    await create();
    const { cookie } = await loginAs("manager");
    const first = await DELETE(jsonRequest("DELETE", "/api/v2/reservations/1", undefined, cookie), ctx(1));
    expect(first.status).toBe(200);
    expect((await json<{ reservation: Reservation }>(first)).reservation.name).toBe("Jana Nováková");
    expect((await DELETE(jsonRequest("DELETE", "/api/v2/reservations/1", undefined, cookie), ctx(1))).status).toBe(404);
  });

  it("requires a session", async () => {
    expect((await DELETE(jsonRequest("DELETE", "/api/v2/reservations/1"), ctx(1))).status).toBe(401);
  });
});
