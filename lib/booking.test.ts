import { describe, expect, it } from "vitest";
import {
  busyRanges,
  conflictsOf,
  dayLabel,
  defaultSettings,
  durationLabel,
  estimateSlots,
  firstFree,
  firstStartThatFits,
  freeCount,
  freeRunFrom,
  initials,
  isIsoDate,
  isWorkDay,
  layoutColumns,
  mergeRanges,
  priceLabel,
  priceList,
  publicBookingSlots,
  settingsForDate,
  weeklyHoursOf,
  servicesLabel,
  slotLabel,
  slotsForMinutes,
  weekdayIndex,
} from "./booking";

const s = defaultSettings;

describe("daily opening hours", () => {
  const schedule = { ...s, weeklyHours: [{ openSlot: 52, closeSlot: 76 }, null, { openSlot: 32, closeSlot: 64 }, null, null, null, null] };
  it("resolves independent Monday and Wednesday hours and closes Tuesday", () => {
    expect(publicBookingSlots(schedule, [], "2026-09-07").map(slotLabel)).toEqual(
      Array.from({ length: 12 }, (_, i) => slotLabel(52 + 2 * i)),
    );
    expect(settingsForDate("2026-09-09", schedule)).toMatchObject({ openSlot: 32, closeSlot: 64 });
    expect(publicBookingSlots(schedule, [], "2026-09-08")).toEqual([]);
    expect(isWorkDay("2026-09-08", schedule)).toBe(false);
  });
  it("keeps legacy opening hours and clips buffers to the day's hours", () => {
    expect(weeklyHoursOf(s)[0]).toEqual({ openSlot: 28, closeSlot: 76 });
    expect(weeklyHoursOf(s)[6]).toBeNull();
    expect(busyRanges("2026-09-07", [{ date: "2026-09-07", slotStart: 52, slotEnd: 54, status: "new" }], schedule)).toEqual([[52, 56]]);
  });
});

describe("public half-hour availability", () => {
  it("offers :00/:30 even with legacy 15-minute settings and clips opening hours", () => {
    const settings = { ...s, openSlot: 77, closeSlot: 83, stepMinutes: 15 };
    expect(publicBookingSlots(settings).map(slotLabel)).toEqual(["19:30", "20:00"]);
  });

  it("blocks a whole cell for a partial overlap and skips 15-minute gaps", () => {
    const settings = { ...s, openSlot: 78, closeSlot: 86 };
    expect(publicBookingSlots(settings, [[79, 81]]).map(slotLabel)).toEqual(["20:30", "21:00"]);
    expect(publicBookingSlots({ ...settings, closeSlot: 80 }, [[79, 80]])).toEqual([]);
  });
});

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

describe("services and estimates", () => {
  const packages = [
    { name: "Exteriér", price: "Domluvou", showCurrency: false, durationMinutes: 180 },
    { name: "Interiér", price: "1 500", durationMinutes: 150 },
    { name: "Tepování", price: "od 500", durationMinutes: 100 },
  ];

  it("converts minutes to whole slots and sums estimates", () => {
    expect(slotsForMinutes(15)).toBe(1);
    expect(slotsForMinutes(100)).toBe(7);
    expect(slotsForMinutes(0)).toBe(1);
    expect(estimateSlots(["Interiér", "Tepování"], packages)).toBe(10 + 7);
    expect(estimateSlots(["Neznámá"], packages)).toBe(0);
    expect(estimateSlots([], packages)).toBe(0);
  });

  it("labels services and lists prices side by side", () => {
    expect(servicesLabel(["Interiér", "Tepování"])).toBe("Interiér + Tepování");
    expect(priceList(["Interiér", "Exteriér", "Tepování"], packages)).toBe("Interiér 1 500 Kč · Exteriér Domluvou · Tepování od 500 Kč");
    expect(priceList([], packages)).toBe("");
  });

  it("measures the free run from a start and finds the first fitting start", () => {
    const busy: Array<[number, number]> = [[36, 44], [60, 76]];
    expect(freeRunFrom(28, busy, s)).toBe(8);
    expect(freeRunFrom(44, busy, s)).toBe(16);
    expect(freeRunFrom(60, busy, s)).toBe(0);
    expect(firstStartThatFits(8, busy, s)).toBe(28);
    expect(firstStartThatFits(9, busy, s)).toBe(44);
    expect(firstStartThatFits(17, busy, s)).toBeNull();
    expect(firstStartThatFits(48, [], s)).toBe(28);
  });
});
