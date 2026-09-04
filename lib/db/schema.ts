import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["admin", "manager", "viewer"]);

// new = came in from the website, waiting for a call; confirmed = agreed with
// the client; done = finished; cancelled = kept for history, never blocks time.
export const bookingStatus = pgEnum("booking_status", ["new", "confirmed", "done", "cancelled"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("viewer"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("users_email_unique").on(table.email)]);

// A booking occupies quarter-hour slots [slotStart, slotEnd) on one day;
// slot 0 = 00:00, slot 28 = 07:00, slot 96 = 24:00.
export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  /** Package names the customer ticked; several per booking. */
  services: jsonb("services").$type<string[]>().notNull().default([]),
  address: varchar("address", { length: 240 }).notNull(),
  note: text("note").notNull().default(""),
  date: date("date").notNull(),
  slotStart: integer("slot_start").notNull(),
  slotEnd: integer("slot_end").notNull(),
  status: bookingStatus("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("reservations_date_idx").on(table.date),
  index("reservations_email_idx").on(table.email),
]);

export const pricePackages = pgTable("price_packages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  price: varchar("price", { length: 30 }).notNull(),
  showCurrency: boolean("show_currency").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  /** Estimated duration used to derive the booking end; multiples of 15. */
  durationMinutes: integer("duration_minutes").notNull().default(120),
  items: jsonb("items").$type<string[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("price_packages_sort_order_idx").on(table.sortOrder)]);

// Single-row table (id = 1) with the opening hours the public calendar offers.
export const settings = pgTable("settings", {
  id: integer("id").primaryKey(),
  openSlot: integer("open_slot").notNull().default(28),
  closeSlot: integer("close_slot").notNull().default(76),
  workDays: jsonb("work_days").$type<number[]>().notNull().default([1, 1, 1, 1, 1, 1, 0]),
  stepMinutes: integer("step_minutes").notNull().default(15),
  bufferMinutes: integer("buffer_minutes").notNull().default(30),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
