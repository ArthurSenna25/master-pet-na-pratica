-- Rollback da 0008 (F10). TRANSACIONAL e com guarda: se existir lead de mentoria, aborta SEM alterar nada
-- (as colunas apagadas seriam a única forma de identificá-los, e o SET NOT NULL falharia com ja_fez_mentoria nulo).
-- Com leads de mentoria: exportar (leads.csv) e decidir antes (apagar `delete from lead where campanha = 'mentoria'` ou preencher ja_fez_mentoria).
-- Depois de rodar, apagar a linha da 0008 em drizzle.__drizzle_migrations (hash = sha256 do arquivo drizzle/0008_f10_campanha.sql).
BEGIN;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM lead WHERE campanha = 'mentoria') THEN
    RAISE EXCEPTION 'Existem leads de mentoria: exporte/decida antes do rollback da 0008';
  END IF;
END $$;
ALTER TABLE "lead" DROP CONSTRAINT "lead_ja_fez_ck";
ALTER TABLE "lead" DROP CONSTRAINT "lead_origem_campanha_ck";
ALTER TABLE "lead" DROP CONSTRAINT "lead_campanha_ck";
ALTER TABLE "rate_limit" DROP COLUMN "campanha";
ALTER TABLE "lead" DROP COLUMN "origem_campanha";
ALTER TABLE "lead" DROP COLUMN "campanha";
ALTER TABLE "lead" ALTER COLUMN "ja_fez_mentoria" SET NOT NULL;
COMMIT;
