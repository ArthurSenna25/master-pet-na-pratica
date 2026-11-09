import { getDb } from "../db";
import { ADMIN_ACOES, adminEvents } from "../db/schema";

export type AdminAcao = (typeof ADMIN_ACOES)[number];

/** Só ação + data UTC (default do banco). Nunca passar IP, e-mail ou id de lead. */
export async function registrarAdminEvento(acao: AdminAcao, db = getDb()): Promise<void> {
  await db.insert(adminEvents).values({ acao });
}
