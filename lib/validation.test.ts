import { describe, expect, it } from "vitest";
import { parsePricePackage, parseReservation, validEmail } from "@/lib/validation";

const validReservation = {
  name: "  Jan Novák ",
  phone: "+420 777 123 456",
  email: "Jan@Example.COM",
  service: "Interiér",
  address: "Ostrava, Hlavní 1",
  note: "  Please ring twice. ",
};

describe("parseReservation", () => {
  it("normalizes a valid body", () => {
    expect(parseReservation(validReservation)).toEqual({
      name: "Jan Novák",
      phone: "+420 777 123 456",
      email: "jan@example.com",
      service: "Interiér",
      address: "Ostrava, Hlavní 1",
      note: "Please ring twice.",
    });
  });

  it("allows an empty note", () => {
    const body: Record<string, unknown> = { ...validReservation };
    delete body.note;
    expect(parseReservation(body)?.note).toBe("");
  });

  it.each(["name", "phone", "email", "service", "address"])(
    "returns null when %s is missing",
    (field) => {
      expect(parseReservation({ ...validReservation, [field]: "" })).toBeNull();
    },
  );

  it("rejects a single-word name", () => {
    expect(parseReservation({ ...validReservation, name: "Jan" })).toBeNull();
  });

  it("rejects a phone number with fewer than 9 digits", () => {
    expect(parseReservation({ ...validReservation, phone: "12345678" })).toBeNull();
  });

  it("rejects an invalid email", () => {
    expect(parseReservation({ ...validReservation, email: "not-an-email" })).toBeNull();
  });

  it("truncates over-long fields", () => {
    const long = "Jan " + "x".repeat(500);
    expect(parseReservation({ ...validReservation, name: long })?.name).toHaveLength(120);
  });
});

describe("parsePricePackage", () => {
  it("normalizes a valid body and defaults showCurrency to true", () => {
    expect(
      parsePricePackage({ name: " Exteriér ", price: " 1500 ", items: [" Mytí ", "", "Vosk"] }),
    ).toEqual({ name: "Exteriér", price: "1500", showCurrency: true, items: ["Mytí", "Vosk"] });
  });

  it("keeps showCurrency false when explicitly disabled", () => {
    expect(
      parsePricePackage({ name: "A", price: "od 900", items: ["x"], showCurrency: false })
        ?.showCurrency,
    ).toBe(false);
  });

  it("returns null when items are empty or missing", () => {
    expect(parsePricePackage({ name: "A", price: "1", items: [] })).toBeNull();
    expect(parsePricePackage({ name: "A", price: "1" })).toBeNull();
  });

  it("caps items at 12", () => {
    const items = Array.from({ length: 20 }, (_, i) => `item ${i}`);
    expect(parsePricePackage({ name: "A", price: "1", items })?.items).toHaveLength(12);
  });
});

describe("validEmail", () => {
  it("accepts a well-formed address", () => {
    expect(validEmail("user@example.com")).toBe(true);
  });

  it("rejects malformed addresses", () => {
    expect(validEmail("user@")).toBe(false);
    expect(validEmail("user example.com")).toBe(false);
    expect(validEmail("")).toBe(false);
  });
});
