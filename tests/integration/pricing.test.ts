import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/v2/pricing/route";
import { PATCH } from "@/app/api/v2/pricing/[id]/route";
import { ctx, json, jsonRequest, loginAs } from "./helpers";

const interior = { name: "Interiér", price: "1 500", items: ["Vysávání", "Plasty"] };
const exterior = { name: "Exteriér", price: "Domluvou", showCurrency: false, items: ["Čištění kol"] };

type Package = { id: number; name: string; price: string; showCurrency: boolean; items: string[]; sortOrder: number };

describe("GET /api/v2/pricing (public)", () => {
  it("returns packages ordered by sortOrder", async () => {
    const { cookie } = await loginAs("manager");
    await POST(jsonRequest("POST", "/api/v2/pricing", interior, cookie));
    await POST(jsonRequest("POST", "/api/v2/pricing", exterior, cookie));
    const body = await json<{ packages: Package[] }>(await GET());
    expect(body.packages.map((p) => [p.name, p.sortOrder])).toEqual([
      ["Interiér", 1],
      ["Exteriér", 2],
    ]);
    expect(body.packages[1].showCurrency).toBe(false);
  });
});

describe("POST /api/v2/pricing", () => {
  it("requires manager or admin", async () => {
    expect((await POST(jsonRequest("POST", "/api/v2/pricing", interior))).status).toBe(401);
    const { cookie } = await loginAs("viewer");
    expect((await POST(jsonRequest("POST", "/api/v2/pricing", interior, cookie))).status).toBe(403);
  });

  it("creates a package with the next sortOrder", async () => {
    const { cookie } = await loginAs("admin");
    const response = await POST(jsonRequest("POST", "/api/v2/pricing", interior, cookie));
    expect(response.status).toBe(201);
    const body = await json<{ package: Package }>(response);
    expect(body.package).toMatchObject({ name: "Interiér", price: "1 500", showCurrency: true, items: ["Vysávání", "Plasty"], sortOrder: 1 });
  });

  it("rejects a package without items", async () => {
    const { cookie } = await loginAs("admin");
    expect((await POST(jsonRequest("POST", "/api/v2/pricing", { name: "X", price: "1", items: [] }, cookie))).status).toBe(400);
  });
});

describe("PATCH /api/v2/pricing/[id]", () => {
  it("updates an existing package", async () => {
    const { cookie } = await loginAs("manager");
    await POST(jsonRequest("POST", "/api/v2/pricing", interior, cookie));
    const response = await PATCH(jsonRequest("PATCH", "/api/v2/pricing/1", { ...interior, price: "1 800" }, cookie), ctx(1));
    expect(response.status).toBe(200);
    expect((await json<{ package: Package }>(response)).package.price).toBe("1 800");
  });

  it("returns 404 for a missing package and 400 for invalid input", async () => {
    const { cookie } = await loginAs("manager");
    expect((await PATCH(jsonRequest("PATCH", "/api/v2/pricing/42", interior, cookie), ctx(42))).status).toBe(404);
    expect((await PATCH(jsonRequest("PATCH", "/api/v2/pricing/1", { name: "" }, cookie), ctx(1))).status).toBe(400);
  });
});
