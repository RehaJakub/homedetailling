import { expect, it } from "vitest";
import { readJsonObject } from "./request";

it.each(["null", "[]", "42", '"text"', "{", ""])("rejects invalid JSON object %s", async body => {
  expect(await readJsonObject(new Request("http://test.local", { method: "POST", body }))).toBeNull();
});

it("accepts JSON objects", async () => {
  expect(await readJsonObject(new Request("http://test.local", { method: "POST", body: '{"name":"Test"}' }))).toEqual({ name: "Test" });
});
