import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { adminEvents, auditLog, consentEvents, lead } from "../db/schema";
import { registrarExportacao } from "./events";
import { montarCsv } from "./csv";

// campanha: só nas linhas de consent_events (join com lead; anonimizado mantém). audit_log e admin_events ficam SEM campanha: o audit_log não tem FK
// (sobrevive à exclusão do lead, então o lead pode não existir mais) e admin_events não é de lead.
// Sem nome, WhatsApp, origem (URL), ip_hmac, user_agent nem texto livre: só ação/tipo, ids, versão/hash e datas UTC.
export const CABECALHO_AUDITORIA = ["fonte", "id", "evento", "lead_id", "campanha", "texto_versao", "texto_hash", "data_utc"] as const;

/**
 * Grava o próprio export (admin_events + audit_log, sem dado pessoal) ANTES de ler, na mesma transação:
 * o arquivo entregue já contém a linha que prova que ele foi gerado. Quem chamar DEVE ter checado a sessão.
 * ponytail: sem LIMIT (volume N2 pequeno); se passar de ~100 mil linhas, paginar/stream.
 */
export async function gerarCsvAuditoria(db = getDb()): Promise<string> {
  await registrarExportacao("export_auditoria", db);
  const [audit, consent, admin] = await Promise.all([
    db.select().from(auditLog).orderBy(asc(auditLog.criadoEm)),
    db.select({ c: consentEvents, campanha: lead.campanha }).from(consentEvents).leftJoin(lead, eq(lead.id, consentEvents.leadId)).orderBy(asc(consentEvents.aceitoEm)),
    db.select().from(adminEvents).orderBy(asc(adminEvents.criadoEm)),
  ]);
  const linhas = [
    ...audit.map((r) => ["audit_log", r.id, r.acao, r.leadId, null, null, null, r.criadoEm] as const),
    ...consent.map(({ c: r, campanha }) => ["consent_events", r.id, r.tipo, r.leadId, campanha, r.textoVersao, r.textoHash, r.aceitoEm] as const),
    ...admin.map((r) => ["admin_events", r.id, r.acao, null, null, null, null, r.criadoEm] as const),
  ].sort((a, b) => a[7].getTime() - b[7].getTime());
  return montarCsv(CABECALHO_AUDITORIA, linhas);
}
