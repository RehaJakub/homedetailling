import { describe, expect, it } from "vitest";
import {
  busyRanges,
  conflictsOf,
  dayLabel,
  defaultSettings,
  durationLabel,
  firstFree,
  freeCount,
  initials,
  isIsoDate,
  isWorkDay,
  layoutColumns,
  mergeRanges,
  priceLabel,
  slotLabel,
  weekdayIndex,
} from "./booking";

const s = defaultSettings;

describe("labels", () => {
  it("formats slots and durations", () => {
    expect(slotLabel(28)).toBe("7:00");
    expect(slotLabel(55)).toBe("13:45");
    expect(durationLabel(10)).toBe("2 h 30 min");
    expect(durationLabel(4)).toBe("1 h");
    expect(durationLabel(1)).toBe("15 min");
  });

  it("formats Czech day labels and weekday index", () => {
    expect(dayLabel("2026-09-08")).toBe("Út 8. 9.");
    expect(weekdayIndex("2026-09-07")).toBe(0);
    expect(weekdayIndex("2026-09-13")).toBe(6);
    expect(isWorkDay("2026-09-13", s)).toBe(false);
    expect(isWorkDay("2026-09-12", s)).toBe(true);
  });

  it("formats prices", () => {
    expect(priceLabel("1 500")).toBe("1 500 Kč");
    expect(priceLabel("od 500")).toBe("od 500 Kč");
    expect(priceLabel("Domluvou")).toBe("Domluvou");
    expect(priceLabel("1 500", false)).toBe("1 500");
  });

  it("validates ISO dates", () => {
    expect(isIsoDate("2026-02-28")).toBe(true);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2026-9-8")).toBe(false);
    expect(isIsoDate(42)).toBe(false);
  });

  it("builds initials", () => {
    expect(initials("Jana Nováková")).toBe("JN");
    expect(initials("")).toBe("?");
  });
});

describe("conflicts and availability", () => {
  const bookings = [
    { id: 1, date: "2026-09-08", slotStart: 36, slotEnd: 48, status: "confirmed" as const },
    { id: 2, date: "2026-09-08", slotStart: 44, slotEnd: 52, status: "new" as const },
    { id: 3, date: "2026-09-08", slotStart: 60, slotEnd: 64, status: "cancelled" as const },
    { id: 4, date: "2026-09-09", slotStart: 36, slotEnd: 48, status: "confirmed" as const },
  ];

  it("finds strict overlaps among active bookings on the same day", () => {
    expect(conflictsOf(bookings[0], bookings).map((b) => b.id)).toEqual([2]);
    expect(conflictsOf({ id: null, date: "2026-09-08", slotStart: 48, slotEnd: 52, status: "new" }, bookings).map((b) => b.id)).toEqual([2]);
    expect(conflictsOf({ id: null, date: "2026-09-08", slotStart: 52, slotEnd: 60, status: "new" }, bookings)).toEqual([]);
    expect(conflictsOf({ id: null, date: "2026-09-08", slotStart: 60, slotEnd: 64, status: "new" }, bookings)).toEqual([]);
  });

  it("widens busy ranges by the buffer and merges them", () => {
    expect(busyRanges("2026-09-08", bookings, s)).toEqual([[34, 54]]);
    expect(busyRanges("2026-09-08", bookings, { ...s, bufferMinutes: 0 })).toEqual([[36, 52]]);
    expect(busyRanges("2026-09-10", bookings, s)).toEqual([]);
  });

  it("blocks the past on the current day", () => {
    expect(busyRanges("2026-09-10", bookings, s, 40)).toEqual([[28, 41]]);
  });

  it("counts free slots and finds the first one", () => {
    const busy = busyRanges("2026-09-08", bookings, s);
    expect(freeCount(busy, s)).toBe(48 - 20);
    expect(firstFree(busy, s)).toBe(28);
    expect(firstFree([[28, 76]], s)).toBeNull();
    expect(mergeRanges([[10, 12], [11, 15], [20, 22]])).toEqual([[10, 15], [20, 22]]);
  });
});

describe("layoutColumns", () => {
  it("places overlapping events side by side and resets between clusters", () => {
    const out = layoutColumns([
      { id: "a", slotStart: 36, slotEnd: 48 },
      { id: "b", slotStart: 44, slotEnd: 52 },
      { id: "c", slotStart: 60, slotEnd: 64 },
    ]);
    const byId = Object.fromEntries(out.map((e) => [e.id, e]));
    expect([byId.a.col, byId.a.cols]).toEqual([0, 2]);
    expect([byId.b.col, byId.b.cols]).toEqual([1, 2]);
    expect([byId.c.col, byId.c.cols]).toEqual([0, 1]);
  });
});
