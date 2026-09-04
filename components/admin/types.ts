import type { BookingStatus, Settings } from "@/lib/booking";

export type Booking = {
  id: number;
  name: string;
  phone: string;
  email: string;
  service: string;
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
  items: string[];
  sortOrder: number;
};

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
  service: string;
  date: string;
  a: number;
  b: number;
  status: BookingStatus;
  note: string;
};

export type Customer = { email: string; name: string; phone: string; orders: Booking[] };

export type Modal =
  | { type: "edit"; draft: Draft; orig: string | null }
  | { type: "price"; pd: { id: number | null; name: string; price: string; items: string; featured: boolean; showCurrency: boolean } }
  | { type: "customer"; email: string }
  | { type: "user"; ud: { name: string; email: string; role: Role; password: string } }
  | null;

export const ROLE_LABEL: Record<Role, string> = { admin: "Admin", manager: "Správce", viewer: "Pouze čtení" };

export type { BookingStatus, Settings };
