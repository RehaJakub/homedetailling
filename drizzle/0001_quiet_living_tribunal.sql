ALTER TABLE "price_packages" ADD COLUMN "duration_minutes" integer DEFAULT 120 NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "services" jsonb DEFAULT '[]'::jsonb NOT NULL;