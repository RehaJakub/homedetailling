import { afterEach, describe, expect, it, vi } from "vitest";
import { notifyNewReservation } from "@/lib/ntfy";

const reservation = {
  date: "2026-09-21",
  slotStart: 60,
  slotEnd: 72,
  services: ["Interiér"],
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("ntfy reservation notifications", () => {
  it("does nothing when no topic is configured", async () => {
    vi.stubEnv("NTFY_TOPIC", "");
    const publish = vi.fn();
    vi.stubGlobal("fetch", publish);

    await expect(notifyNewReservation(reservation)).resolves.toBe(false);
    expect(publish).not.toHaveBeenCalled();
  });

  it("publishes a private-detail-free JSON message", async () => {
    vi.stubEnv("NTFY_TOPIC", "homedetailing-secret-topic");
    vi.stubEnv("NTFY_TOKEN", "tk_example");
    const publish = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", publish);

    await expect(notifyNewReservation(reservation)).resolves.toBe(true);
    expect(publish).toHaveBeenCalledOnce();

    const [url, init] = publish.mock.calls[0] as [URL, RequestInit];
    expect(url.toString()).toBe("https://ntfy.sh/");
    expect(init.headers).toMatchObject({ Authorization: "Bearer tk_example", "Content-Type": "application/json" });
    const payload = JSON.parse(String(init.body));
    expect(payload).toMatchObject({
      topic: "homedetailing-secret-topic",
      title: "Nová rezervace · Home Detailing",
      priority: 4,
      click: "https://homedetailing.cz/admin",
    });
    expect(payload.message).toContain("15:00–18:00");
    expect(payload.message).toContain("Interiér");
    expect(payload.message).not.toContain("@");
    expect(payload.message).not.toContain("+420");
  });

  it("reports a failed publish so the caller can log it", async () => {
    vi.stubEnv("NTFY_TOPIC", "homedetailing-secret-topic");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("denied", { status: 403 })));

    await expect(notifyNewReservation(reservation)).rejects.toThrow("HTTP 403");
  });
});
