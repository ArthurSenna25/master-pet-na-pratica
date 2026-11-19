ALTER TABLE "lead" ALTER COLUMN "ja_fez_mentoria" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "lead" ADD COLUMN "campanha" text DEFAULT 'presencial' NOT NULL;--> statement-breakpoint
ALTER TABLE "lead" ADD COLUMN "origem_campanha" text;--> statement-breakpoint
ALTER TABLE "rate_limit" ADD COLUMN "campanha" text DEFAULT 'presencial' NOT NULL;--> statement-breakpoint
ALTER TABLE "lead" ADD CONSTRAINT "lead_campanha_ck" CHECK ("lead"."campanha" in ('presencial','mentoria'));--> statement-breakpoint
ALTER TABLE "lead" ADD CONSTRAINT "lead_origem_campanha_ck" CHECK ("lead"."origem_campanha" is null or (char_length("lead"."origem_campanha") <= 40 and "lead"."origem_campanha" ~ '^[a-z0-9][a-z0-9_-]*$'));--> statement-breakpoint
ALTER TABLE "lead" ADD CONSTRAINT "lead_ja_fez_ck" CHECK ("lead"."campanha" = 'mentoria' or "lead"."ja_fez_mentoria" is not null);