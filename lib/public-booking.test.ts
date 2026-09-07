import { expect, it } from "vitest";
import { busyRanges, defaultSettings, publicBookingSettings, publicBookingStarts, slotLabel } from "./booking";

it("offers half-hour starts only when three consecutive hours fit", () => {
  expect(publicBookingStarts({ ...defaultSettings, openSlot: 60, closeSlot: 84 }).map(slotLabel))
    .toEqual(["15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"]);
  expect(publicBookingStarts({ ...defaultSettings, openSlot: 60, closeSlot: 70 })).toEqual([]);
});

it("15:00 booking blocks up to 18:00, not 18:30, and disallows earlier overlapping starts", () => {
  const s = publicBookingSettings({ ...defaultSettings, closeSlot: 84, bufferMinutes: 45 });
  const busy = busyRanges("2026-09-08", [{ date: "2026-09-08", slotStart: 60, slotEnd: 72, status: "new" }], s);
  expect(busy).toEqual([[60, 72]]);
  const starts = publicBookingStarts(s, busy);
  expect(starts).toContain(48); // 12:00–15:00 may end exactly at the next start.
  expect(starts.filter(start => start >= 50).map(slotLabel)).toEqual(["18:00"]);
});

it("respects daily hours, closed days and small fragmented gaps", () => {
  const s = { ...defaultSettings, weeklyHours: [{ openSlot: 52, closeSlot: 76 }, null, null, null, null, null, null] };
  expect(publicBookingStarts(s, [], "2026-09-07").map(slotLabel)).toEqual(["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"]);
  expect(publicBookingStarts(s, [], "2026-09-08")).toEqual([]);
  expect(publicBookingStarts(s, [[60, 68]], "2026-09-07")).toEqual([]);
});
