import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/v2/availability/route";
import { POST } from "@/app/api/v2/reservations/route";
import { PUT } from "@/app/api/v2/settings/route";
import { addDays, weekdayIndex } from "@/lib/booking";
import { futureWorkday, json, jsonRequest, loginAs } from "./helpers";

type Availability = { settings: { openSlot: number; closeSlot: number; bufferMinutes: number }; today: string; days: Record<string, { closed: boolean; busy: number[][] }> };

const get = (query: string) => GET(jsonRequest("GET", `/api/v2/availability?${query}`));

describe("GET /api/v2/availability", () => {
  it("validates the query", async () => {
    expect((await get("date=2026-9-8")).status).toBe(400);
    expect((await get("from=2026-09-01&to=2026-08-01")).status).toBe(400);
    expect((await get("from=2026-01-01&to=2026-12-31")).status).toBe(400);
    expect((await get("")).status).toBe(400);
  });

  it("marks closed days, blocks the past and widens bookings by the buffer", async () => {
    const day = futureWorkday();
    let sunday = day;
    while (weekdayIndex(sunday) !== 6) sunday = addDays(sunday, 1);
    const { cookie } = await loginAs("manager");
    await POST(jsonRequest("POST", "/api/v2/reservations", { name: "Jana Nováková", phone: "+420777123456", email: "j@example.test", services: ["Interiér"], address: "Ostrava", date: day, a: 36, b: 48, status: "confirmed" }, cookie));
    await POST(jsonRequest("POST", "/api/v2/reservations", { name: "Petr Dvořák", phone: "+420777123456", email: "p@example.test", services: ["Interiér"], address: "Ostrava", date: day, a: 60, b: 64, status: "cancelled" }, cookie));

    const body = await json<Availability>(await get(`from=${day}&to=${sunday}`));
    expect(body.settings).toMatchObject({ openSlot: 28, closeSlot: 76, bufferMinutes: 30 });
    expect(body.days[day]).toEqual({ closed: false, busy: [[34, 50]] });
    expect(body.days[sunday]).toEqual({ closed: true, busy: [] });

    const past = await json<Availability>(await get(`date=${addDays(body.today, -1)}`));
    expect(Object.values(past.days)[0].closed).toBe(true);
  });

  it("reflects updated opening hours", async () => {
    const { cookie } = await loginAs("admin");
    const saved = await PUT(jsonRequest("PUT", "/api/v2/settings", { openSlot: 32, closeSlot: 72, stepMinutes: 30, bufferMinutes: 0, workDays: [1, 1, 1, 1, 1, 0, 0] }, cookie));
    expect(saved.status).toBe(200);
    const day = futureWorkday();
    let saturday = day;
    while (weekdayIndex(saturday) !== 5) saturday = addDays(saturday, 1);
    const body = await json<Availability>(await get(`date=${saturday}`));
    expect(body.settings.openSlot).toBe(32);
    expect(body.days[saturday].closed).toBe(true);
  });
});
