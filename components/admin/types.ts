import type { BookingStatus, Settings } from "@/lib/booking";

export type Booking = {
  id: number;
  name: string;
  phone: string;
  email: string;
  services: string[];
  address: string;
  note: string;
  date: string;
  slotStart: number;
  slotEnd: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
};

export type Package = {
  id: number;
  name: string;
  price: string;
  showCurrency: boolean;
  featured: boolean;
  durationMinutes: number;
  items: string[];
  sortOrder: number;
};

/** Editable copy of a package in the pricing modal; `items` is newline-separated. */
export type PriceDraft = { id: number | null; name: string; price: string; items: string; featured: boolean; showCurrency: boolean; durationMinutes: number };

export type Role = "admin" | "manager" | "viewer";

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt?: string;
};

export type SessionUser = { id: number; name: string; email: string; role: Role };

/** Editable copy of a booking; `a`/`b` are slot indices, `b` exclusive. */
export type Draft = {
  id: number | null;
  name: string;
  phone: string;
  email: string;
  address: string;
  services: string[];
  date: string;
  a: number;
  b: number;
  status: BookingStatus;
  note: string;
};

export type Customer = { email: string; name: string; phone: string; orders: Booking[] };

export type Modal =
  | { type: "edit"; draft: Draft; orig: string | null }
  | { type: "price"; pd: PriceDraft }
  | { type: "customer"; email: string }
  | { type: "user"; ud: { name: string; email: string; role: Role; password: string } }
  | null;

export const ROLE_LABEL: Record<Role, string> = { admin: "Admin", manager: "Správce", viewer: "Pouze čtení" };

export type { BookingStatus, Settings };
