import { describe, expect, it } from "vitest";
import { parsePricePackage, parseReservation, parseReservationPatch, parseServices, parseSettings, parseSlotRange, validEmail } from "@/lib/validation";

const validReservation = {
  name: "  Jan Novák ",
  phone: "+420 777 123 456",
  email: "Jan@Example.COM",
  services: ["Interiér", " Tepování ", "Interiér"],
  address: "Ostrava, Hlavní 1",
  note: "  Please ring twice. ",
  date: "2026-09-08",
  a: 36,
  b: 48,
};

describe("parseReservation", () => {
  it("normalizes a valid body", () => {
    expect(parseReservation(validReservation)).toEqual({
      name: "Jan Novák",
      phone: "+420 777 123 456",
      email: "jan@example.com",
      services: ["Interiér", "Tepování"],
      address: "Ostrava, Hlavní 1",
      note: "Please ring twice.",
      date: "2026-09-08",
      slotStart: 36,
      slotEnd: 48,
    });
  });

  it("accepts slotStart/slotEnd names and numeric strings", () => {
    const body: Record<string, unknown> = { ...validReservation, a: undefined, b: undefined, slotStart: "36", slotEnd: "40" };
    expect(parseReservation(body)).toMatchObject({ slotStart: 36, slotEnd: 40 });
  });

  it("allows an empty note", () => {
    const body: Record<string, unknown> = { ...validReservation };
    delete body.note;
    expect(parseReservation(body)?.note).toBe("");
  });

  it.each(["name", "phone", "email", "address"])("returns null when %s is missing", (field) => {
    expect(parseReservation({ ...validReservation, [field]: "" })).toBeNull();
  });

  it("accepts the legacy single service and rejects no services", () => {
    const body: Record<string, unknown> = { ...validReservation, services: undefined, service: "Exteriér" };
    expect(parseReservation(body)?.services).toEqual(["Exteriér"]);
    expect(parseReservation({ ...validReservation, services: [] })).toBeNull();
    expect(parseReservation({ ...validReservation, services: ["", "  "] })).toBeNull();
  });

  it("rejects a single-word name", () => {
    expect(parseReservation({ ...validReservation, name: "Jan" })).toBeNull();
  });

  it("rejects a phone number with fewer than 9 digits", () => {
    expect(parseReservation({ ...validReservation, phone: "12345678" })).toBeNull();
  });

  it("rejects an invalid email", () => {
    expect(parseReservation({ ...validReservation, email: "not-an-email" })).toBeNull();
  });

  it("rejects a missing or malformed slot range", () => {
    expect(parseReservation({ ...validReservation, date: "8.9.2026" })).toBeNull();
    expect(parseReservation({ ...validReservation, a: 48, b: 48 })).toBeNull();
    expect(parseReservation({ ...validReservation, a: -1 })).toBeNull();
    expect(parseReservation({ ...validReservation, b: 97 })).toBeNull();
  });

  it("truncates over-long fields", () => {
    const long = "Jan " + "x".repeat(500);
    expect(parseReservation({ ...validReservation, name: long })?.name).toHaveLength(120);
  });
});

describe("parseServices", () => {
  it("normalizes, dedups and caps the list", () => {
    expect(parseServices({ services: [" A ", "B", "A", ""] })).toEqual(["A", "B"]);
    expect(parseServices({ service: "Solo" })).toEqual(["Solo"]);
    expect(parseServices({})).toBeNull();
    expect(parseServices({ services: Array.from({ length: 20 }, (_, i) => `s${i}`) })).toHaveLength(12);
  });
});

describe("parseSlotRange", () => {
  it("returns the range or null", () => {
    expect(parseSlotRange({ date: "2026-09-08", a: 28, b: 32 })).toEqual({ date: "2026-09-08", slotStart: 28, slotEnd: 32 });
    expect(parseSlotRange({ date: "2026-09-08", a: 32, b: 28 })).toBeNull();
    expect(parseSlotRange({ a: 28, b: 32 })).toBeNull();
  });
});

describe("parseReservationPatch", () => {
  it("returns only the fields present", () => {
    expect(parseReservationPatch({ status: "confirmed", b: 50 })).toEqual({ status: "confirmed", slotEnd: 50 });
    expect(parseReservationPatch({})).toEqual({});
  });

  it("normalizes and validates present fields", () => {
    expect(parseReservationPatch({ email: " Jana@Example.cz " })).toEqual({ email: "jana@example.cz" });
    expect(parseReservationPatch({ note: "" })).toEqual({ note: "" });
    expect(parseReservationPatch({ services: ["Interiér"] })).toEqual({ services: ["Interiér"] });
    expect(parseReservationPatch({ service: "Interiér" })).toEqual({ services: ["Interiér"] });
    expect(parseReservationPatch({ services: [] })).toBeNull();
    expect(parseReservationPatch({ status: "gone" })).toBeNull();
    expect(parseReservationPatch({ name: "Jana" })).toBeNull();
    expect(parseReservationPatch({ email: "nope" })).toBeNull();
    expect(parseReservationPatch({ date: "2026-13-01" })).toBeNull();
    expect(parseReservationPatch({ a: "x" })).toBeNull();
  });
});

describe("parsePricePackage", () => {
  it("normalizes a valid body and defaults showCurrency, featured and duration", () => {
    expect(parsePricePackage({ name: " Exteriér ", price: " 1500 ", items: [" Mytí ", "", "Vosk"] })).toEqual({
      name: "Exteriér",
      price: "1500",
      showCurrency: true,
      featured: false,
      durationMinutes: 120,
      items: ["Mytí", "Vosk"],
    });
  });

  it("validates the duration", () => {
    expect(parsePricePackage({ name: "X", price: "1", items: ["a"], durationMinutes: 180 })?.durationMinutes).toBe(180);
    expect(parsePricePackage({ name: "X", price: "1", items: ["a"], durationMinutes: "90" })?.durationMinutes).toBe(90);
    expect(parsePricePackage({ name: "X", price: "1", items: ["a"], durationMinutes: 100 })).toBeNull();
    expect(parsePricePackage({ name: "X", price: "1", items: ["a"], durationMinutes: 0 })).toBeNull();
    expect(parsePricePackage({ name: "X", price: "1", items: ["a"], durationMinutes: 800 })).toBeNull();
  });

  it("keeps explicit showCurrency false and featured true", () => {
    expect(parsePricePackage({ name: "X", price: "Domluvou", showCurrency: false, featured: true, items: ["a"] })).toMatchObject({
      showCurrency: false,
      featured: true,
    });
  });

  it("returns null without name, price or items", () => {
    expect(parsePricePackage({ name: "", price: "1", items: ["a"] })).toBeNull();
    expect(parsePricePackage({ name: "X", price: "", items: ["a"] })).toBeNull();
    expect(parsePricePackage({ name: "X", price: "1", items: [] })).toBeNull();
    expect(parsePricePackage({ name: "X", price: "1" })).toBeNull();
  });

  it("caps the item list at 12", () => {
    const items = Array.from({ length: 20 }, (_, i) => `item ${i}`);
    expect(parsePricePackage({ name: "X", price: "1", items })?.items).toHaveLength(12);
  });
});

describe("parseSettings", () => {
  const valid = { openSlot: 28, closeSlot: 76, stepMinutes: 15, bufferMinutes: 30, workDays: [1, 1, 1, 1, 1, 1, 0] };

  it("accepts a valid body", () => {
    expect(parseSettings(valid)).toEqual(valid);
    expect(parseSettings({ ...valid, workDays: [true, false, 1, 0, 1, 1, 1] })?.workDays).toEqual([1, 0, 1, 0, 1, 1, 1]);
  });

  it("rejects an hour window shorter than one hour, bad steps and no working day", () => {
    expect(parseSettings({ ...valid, closeSlot: 30 })).toBeNull();
    expect(parseSettings({ ...valid, stepMinutes: 20 })).toBeNull();
    expect(parseSettings({ ...valid, bufferMinutes: 10 })).toBeNull();
    expect(parseSettings({ ...valid, workDays: [0, 0, 0, 0, 0, 0, 0] })).toBeNull();
    expect(parseSettings({ ...valid, workDays: [1, 1] })).toBeNull();
  });
});

describe("validEmail", () => {
  it("accepts a normal address", () => {
    expect(validEmail("a@b.cz")).toBe(true);
  });

  it.each(["", "a@b", "a b@c.cz", "@c.cz"])("rejects %j", (value) => {
    expect(validEmail(value)).toBe(false);
  });
});
