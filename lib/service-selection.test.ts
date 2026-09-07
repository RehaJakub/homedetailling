import { expect, it } from "vitest";
import { selectServices } from "./service-selection";
import { parseReservationPatch, parseServices } from "./validation";

it.each([
  ["Basic interiér", "Premium interiér"],
  ["Premium interiér", "Basic interiér"],
])("switches %s to %s without removing exterior", (first, second) => {
  expect(selectServices([first, "Exteriér"], [first, "Exteriér", second])).toEqual(["Exteriér", second]);
});

it("allows deselection and exterior alone", () => {
  expect(selectServices(["Basic interiér", "Exteriér"], ["Exteriér"])).toEqual(["Exteriér"]);
  expect(selectServices(["Premium interiér"], [])).toEqual([]);
});

it("rejects both tiers in create and update validation", () => {
  const services = ["Basic interiér", "Premium interiér"];
  expect(parseServices({ services })).toBeNull();
  expect(parseReservationPatch({ services })).toBeNull();
  expect(parseServices({ services: [" BASIC INTERIÉR ", "Premium interier"] })).toBeNull();
});

it.each(["Basic interiér", "Premium interiér"])("allows %s with exterior", tier => {
  expect(parseServices({ services: [tier, "Exteriér"] })).toEqual([tier, "Exteriér"]);
});
