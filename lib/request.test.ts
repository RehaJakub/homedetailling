import { expect, it } from "vitest";
import { readJsonObject, rejectUnsafeMutation } from "./request";

function jsonRequest(body: string, headers: Record<string, string> = {}) {
  return new Request("http://test.local", {
    method: "POST",
    body,
    headers: { "content-type": "application/json", ...headers },
  });
}

it.each(["null", "[]", "42", '"text"', "{", ""])("rejects invalid JSON object %s", async body => {
  expect(await readJsonObject(jsonRequest(body))).toBeNull();
});

it("accepts JSON objects", async () => {
  expect(await readJsonObject(jsonRequest('{"name":"Test"}'))).toEqual({ name: "Test" });
});

it("rejects non-JSON and oversized bodies", async () => {
  expect(await readJsonObject(new Request("http://test.local", { method: "POST", body: "{}" }))).toBeNull();
  expect(await readJsonObject(jsonRequest(JSON.stringify({ value: "x".repeat(70_000) })))).toBeNull();
});

it("rejects mutations without the app header or from another origin", () => {
  expect(rejectUnsafeMutation(new Request("http://test.local/api", { method: "POST" }))?.status).toBe(403);
  expect(rejectUnsafeMutation(new Request("http://test.local/api", {
    method: "POST",
    headers: { "x-requested-with": "XMLHttpRequest", origin: "https://evil.test" },
  }))?.status).toBe(403);
  expect(rejectUnsafeMutation(new Request("http://test.local/api", {
    method: "POST",
    headers: { "x-requested-with": "XMLHttpRequest", origin: "http://test.local" },
  }))).toBeNull();
});
