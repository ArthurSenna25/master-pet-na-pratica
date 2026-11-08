-- lead.atualizado_em: sempre now() em qualquer UPDATE (o app não precisa lembrar).
CREATE OR REPLACE FUNCTION lead_set_atualizado_em() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.atualizado_em := now();
  RETURN NEW;
END
$$;--> statement-breakpoint
CREATE TRIGGER lead_atualizado_em_tg BEFORE UPDATE ON lead FOR EACH ROW EXECUTE FUNCTION lead_set_atualizado_em();--> statement-breakpoint
-- consent_events: colunas de prova imutáveis. Único UPDATE permitido: zerar ip_hmac e user_agent (anonimizar_lead).
-- DELETE e o ON DELETE CASCADE de lead_id não passam por este trigger.
CREATE OR REPLACE FUNCTION consent_events_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.lead_id IS DISTINCT FROM OLD.lead_id
     OR NEW.tipo IS DISTINCT FROM OLD.tipo
     OR NEW.texto_versao IS DISTINCT FROM OLD.texto_versao
     OR NEW.texto_hash IS DISTINCT FROM OLD.texto_hash
     OR NEW.aceito_em IS DISTINCT FROM OLD.aceito_em
     OR NEW.origem IS DISTINCT FROM OLD.origem THEN
    RAISE EXCEPTION 'consent_events: colunas de prova do consentimento são imutáveis';
  END IF;
  IF (NEW.ip_hmac IS NOT NULL AND NEW.ip_hmac IS DISTINCT FROM OLD.ip_hmac)
     OR (NEW.user_agent IS NOT NULL AND NEW.user_agent IS DISTINCT FROM OLD.user_agent) THEN
    RAISE EXCEPTION 'consent_events: ip_hmac e user_agent só podem ser zerados (anonimização)';
  END IF;
  RETURN NEW;
END
$$;--> statement-breakpoint
CREATE TRIGGER consent_events_guard_tg BEFORE UPDATE ON consent_events FOR EACH ROW EXECUTE FUNCTION consent_events_guard();
