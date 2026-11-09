CREATE TABLE "admin_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"acao" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_events_acao_ck" CHECK ("admin_events"."acao" in ('login','logout','export_auditoria','export_leads'))
);
