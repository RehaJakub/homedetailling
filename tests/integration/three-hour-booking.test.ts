import { expect, it } from "vitest";
import { GET as availability } from "@/app/api/v2/availability/route";
import { GET, POST } from "@/app/api/v2/reservations/route";
import { PUT } from "@/app/api/v2/settings/route";
import { publicBookingStarts } from "@/lib/booking";
import { futureWorkday, jsonRequest, loginAs } from "./helpers";

it("stores a start-only public booking for 3 hours and allows exactly 18:00 after 15:00", async () => {
  const { cookie } = await loginAs("admin");
  const date = futureWorkday();
  await PUT(jsonRequest("PUT", "/", { openSlot: 32, closeSlot: 84, stepMinutes: 30, bufferMinutes: 30, workDays: [1, 1, 1, 1, 1, 1, 1] }, cookie));
  const body = { name: "Jan Test", phone: "777123456", email: "jan@example.test", address: "Ostrava", services: ["Premium interiér"], date, a: 60 };
  expect((await POST(jsonRequest("POST", "/", body))).status).toBe(201);
  const list = await (await GET(jsonRequest("GET", "/", undefined, cookie))).json();
  expect(list.reservations[0]).toMatchObject({ slotStart: 60, slotEnd: 72 });
  const data = await (await availability(jsonRequest("GET", `/api/v2/availability?date=${date}`))).json();
  expect(publicBookingStarts(data.settings, data.days[date].busy).filter(s => s >= 60)).toEqual([72]);
  for (const a of [50, 58, 62, 66, 70]) expect((await POST(jsonRequest("POST", "/", { ...body, a }))).status).toBe(409);
  expect((await POST(jsonRequest("POST", "/", { ...body, a: 60, b: 62 }))).status).toBe(400);
  expect((await POST(jsonRequest("POST", "/", { ...body, a: 74 }))).status).toBe(409);
  expect((await POST(jsonRequest("POST", "/", { ...body, a: 72 }))).status).toBe(201);
});
