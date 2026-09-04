CREATE TYPE "public"."booking_status" AS ENUM('new', 'confirmed', 'done', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'manager', 'viewer');--> statement-breakpoint
CREATE TABLE "price_packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(80) NOT NULL,
	"price" varchar(30) NOT NULL,
	"show_currency" boolean DEFAULT true NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"phone" varchar(40) NOT NULL,
	"email" varchar(254) NOT NULL,
	"service" varchar(80) NOT NULL,
	"address" varchar(240) NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"date" date NOT NULL,
	"slot_start" integer NOT NULL,
	"slot_end" integer NOT NULL,
	"status" "booking_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"open_slot" integer DEFAULT 28 NOT NULL,
	"close_slot" integer DEFAULT 76 NOT NULL,
	"work_days" jsonb DEFAULT '[1,1,1,1,1,1,0]'::jsonb NOT NULL,
	"step_minutes" integer DEFAULT 15 NOT NULL,
	"buffer_minutes" integer DEFAULT 30 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(254) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'viewer' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "price_packages_sort_order_idx" ON "price_packages" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "reservations_date_idx" ON "reservations" USING btree ("date");--> statement-breakpoint
CREATE INDEX "reservations_email_idx" ON "reservations" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");