import "server-only";
import { asc } from "drizzle-orm";
import { getDb } from "../db";
import { adminEvents, auditLog, consentEvents } from "../db/schema";
import { registrarExportacao } from "./events";
import { montarCsv } from "./csv";

// Sem nome, WhatsApp, origem (URL), ip_hmac, user_agent nem texto livre: só ação/tipo, ids, versão/hash e datas UTC.
export const CABECALHO_AUDITORIA = ["fonte", "id", "evento", "lead_id", "texto_versao", "texto_hash", "data_utc"] as const;

/**
 * Grava o próprio export (admin_events + audit_log, sem dado pessoal) ANTES de ler, na mesma transação:
 * o arquivo entregue já contém a linha que prova que ele foi gerado. Quem chamar DEVE ter checado a sessão.
 * ponytail: sem LIMIT (volume N2 pequeno); se passar de ~100 mil linhas, paginar/stream.
 */
export async function gerarCsvAuditoria(db = getDb()): Promise<string> {
  await registrarExportacao("export_auditoria", db);
  const [audit, consent, admin] = await Promise.all([
    db.select().from(auditLog).orderBy(asc(auditLog.criadoEm)),
    db.select().from(consentEvents).orderBy(asc(consentEvents.aceitoEm)),
    db.select().from(adminEvents).orderBy(asc(adminEvents.criadoEm)),
  ]);
  const linhas = [
    ...audit.map((r) => ["audit_log", r.id, r.acao, r.leadId, null, null, r.criadoEm] as const),
    ...consent.map((r) => ["consent_events", r.id, r.tipo, r.leadId, r.textoVersao, r.textoHash, r.aceitoEm] as const),
    ...admin.map((r) => ["admin_events", r.id, r.acao, null, null, null, r.criadoEm] as const),
  ].sort((a, b) => a[6].getTime() - b[6].getTime());
  return montarCsv(CABECALHO_AUDITORIA, linhas);
}
