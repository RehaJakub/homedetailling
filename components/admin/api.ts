import type { Booking, Draft, Package, Settings, User } from "./types";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    cache: "no-store",
    ...init,
    headers: { "X-Requested-With": "XMLHttpRequest", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...(init?.headers ?? {}) },
  });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new ApiError(response.status, data.error ?? "Požadavek se nezdařil.");
  return data;
}

const body = (value: unknown) => JSON.stringify(value);

export const api = {
  me: () => call<{ user: User }>("/api/v2/auth/me"),
  logout: () => call<{ loggedOut: boolean }>("/api/v2/auth/logout", { method: "POST" }),
  changePassword: (current: string, next: string) => call<{ changed: boolean }>("/api/v2/auth/password", { method: "POST", body: body({ current, next }) }),

  reservations: () => call<{ reservations: Booking[] }>("/api/v2/reservations"),
  createBooking: (draft: Omit<Draft, "id">) =>
    call<{ reservation: Booking }>("/api/v2/reservations", { method: "POST", body: body(draftPayload(draft)) }),
  updateBooking: (id: number, draft: Partial<Omit<Draft, "id">>) =>
    call<{ reservation: Booking }>(`/api/v2/reservations/${id}`, { method: "PATCH", body: body(draftPayload(draft)) }),
  deleteBooking: (id: number) => call<{ reservation: Booking }>(`/api/v2/reservations/${id}`, { method: "DELETE" }),

  packages: () => call<{ packages: Package[] }>("/api/v2/pricing"),
  createPackage: (p: Omit<Package, "id" | "sortOrder">) => call<{ package: Package }>("/api/v2/pricing", { method: "POST", body: body(p) }),
  updatePackage: (id: number, p: Omit<Package, "id" | "sortOrder">) => call<{ package: Package }>(`/api/v2/pricing/${id}`, { method: "PATCH", body: body(p) }),
  deletePackage: (id: number) => call<{ package: Package }>(`/api/v2/pricing/${id}`, { method: "DELETE" }),

  users: () => call<{ users: User[] }>("/api/v2/users"),
  createUser: (u: { name: string; email: string; password: string; role: string }) => call<{ user: User }>("/api/v2/users", { method: "POST", body: body(u) }),
  updateUser: (id: number, patch: Record<string, unknown>) => call<{ user: User }>(`/api/v2/users/${id}`, { method: "PATCH", body: body(patch) }),

  settings: () => call<{ settings: Settings }>("/api/v2/settings"),
  saveSettings: (s: Settings) => call<{ settings: Settings }>("/api/v2/settings", { method: "PUT", body: body(s) }),
};

function draftPayload(d: Partial<Omit<Draft, "id">>) {
  const { a, b, ...rest } = d;
  return { ...rest, ...(a !== undefined ? { slotStart: a } : {}), ...(b !== undefined ? { slotEnd: b } : {}) };
}

export function toDraft(r: Booking): Draft {
  return { id: r.id, name: r.name, phone: r.phone, email: r.email, address: r.address, services: r.services, date: r.date, a: r.slotStart, b: r.slotEnd, status: r.status, note: r.note };
}
