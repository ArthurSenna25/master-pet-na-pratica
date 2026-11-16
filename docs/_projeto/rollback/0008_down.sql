-- Rollback da 0008 (F10). Só vale ANTES de existir lead de mentoria: ele apaga as colunas e o ja_fez_mentoria nulo impede o NOT NULL.
-- Com leads de mentoria: decidir antes (exportar e `delete from lead where campanha = 'mentoria'`, ou preencher ja_fez_mentoria).
-- Depois de rodar, apagar a linha da 0008 em drizzle.__drizzle_migrations (hash = sha256 do arquivo).
ALTER TABLE "lead" DROP CONSTRAINT "lead_ja_fez_ck";
ALTER TABLE "lead" DROP CONSTRAINT "lead_origem_campanha_ck";
ALTER TABLE "lead" DROP CONSTRAINT "lead_campanha_ck";
ALTER TABLE "rate_limit" DROP COLUMN "campanha";
ALTER TABLE "lead" DROP COLUMN "origem_campanha";
ALTER TABLE "lead" DROP COLUMN "campanha";
ALTER TABLE "lead" ALTER COLUMN "ja_fez_mentoria" SET NOT NULL;
