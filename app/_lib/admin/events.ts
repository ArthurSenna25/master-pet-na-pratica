import { getDb } from "../db";
import { ADMIN_ACOES, adminEvents, auditLog } from "../db/schema";

export type AdminAcao = (typeof ADMIN_ACOES)[number];

/** Só ação + data UTC (default do banco). Nunca passar IP, e-mail ou id de lead. */
export async function registrarAdminEvento(acao: AdminAcao, db = getDb()): Promise<void> {
  await db.insert(adminEvents).values({ acao });
}

/** Exportação: admin_events + audit_log (lead_id nulo), na mesma transação, sem dado pessoal. Chamar ANTES de ler os dados. */
export async function registrarExportacao(acao: "export_auditoria" | "export_leads", db = getDb()): Promise<void> {
  await db.batch([db.insert(adminEvents).values({ acao }), db.insert(auditLog).values({ acao })]);
}
