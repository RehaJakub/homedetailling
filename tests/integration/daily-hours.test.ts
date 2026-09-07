import { describe, expect, it } from "vitest";
import { GET as availability } from "@/app/api/v2/availability/route";
import { GET as orders, POST } from "@/app/api/v2/reservations/route";
import { GET as settings, PUT } from "@/app/api/v2/settings/route";
import { addDays, weekdayIndex, publicBookingSlots, type Settings } from "@/lib/booking";
import { futureWorkday, json, jsonRequest, loginAs } from "./helpers";

describe("per-day working hours", () => {
  it("persists different hours, enforces them for customers and preserves orders on change", async () => {
    const { cookie } = await loginAs("admin");
    let monday = futureWorkday();
    while (weekdayIndex(monday) !== 0) monday = addDays(monday, 1);
    const tuesday = addDays(monday, 1);
    const wednesday = addDays(monday, 2);
    const weeklyHours = [{ openSlot: 52, closeSlot: 76 }, null, { openSlot: 32, closeSlot: 64 }, null, null, null, null];
    const save = (hours: typeof weeklyHours) => PUT(jsonRequest("PUT", "/api/v2/settings", { weeklyHours: hours, stepMinutes: 30, bufferMinutes: 0 }, cookie));
    expect((await save(weeklyHours)).status).toBe(200);
    const saved = await json<{ settings: Settings }>(await settings(jsonRequest("GET", "/api/v2/settings", undefined, cookie)));
    expect(saved.settings.weeklyHours).toEqual(weeklyHours);
    const getAvailability = async () => json<{ settings: Settings; days: Record<string, { closed: boolean; busy: Array<[number, number]> }> }>(
      await availability(jsonRequest("GET", `/api/v2/availability?from=${monday}&to=${wednesday}`)),
    );
    const available = await getAvailability();
    expect(available.days[tuesday].closed).toBe(true);
    expect(publicBookingSlots(available.settings, [], monday)[0]).toBe(52);
    expect(publicBookingSlots(available.settings, [], wednesday)[0]).toBe(32);
    const book = (date: string, a: number, b: number) => POST(jsonRequest("POST", "/api/v2/reservations", {
      name: "Jakub Test", email: "daily@example.test", phone: "+420777123456", address: "Ostrava",
      services: ["Interiér + tepování"], date, a, b,
    }));
    expect((await book(monday, 32, 44)).status).toBe(409);
    expect((await book(tuesday, 52, 64)).status).toBe(409);
    expect((await book(wednesday, 64, 76)).status).toBe(409);
    expect((await book(monday, 74, 86)).status).toBe(409);
    expect((await book(monday, 64, 76)).status).toBe(201);
    expect((await book(wednesday, 32, 44)).status).toBe(201);
    expect((await save([{ openSlot: 32, closeSlot: 76 }, ...weeklyHours.slice(1)])).status).toBe(200);
    expect((await book(monday, 32, 44)).status).toBe(201);
    expect((await save(Array(7).fill(null))).status).toBe(200);
    expect((await getAvailability()).days[monday].closed).toBe(true);
    expect((await book(monday, 40, 52)).status).toBe(409);
    const list = await json<{ reservations: unknown[] }>(await orders(jsonRequest("GET", "/api/v2/reservations", undefined, cookie)));
    expect(list.reservations).toHaveLength(3);
  });
});
