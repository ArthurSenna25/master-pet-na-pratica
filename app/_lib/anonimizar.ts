import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { auditLog, consentEvents, lead } from "./db/schema";

/**
 * Única exceção a "consent_events só INSERT": zera ip_hmac e user_agent dos eventos e os dados pessoais do lead.
 * Nunca toca texto_versao, texto_hash nem aceito_em. Grava uma linha em audit_log (sem dado pessoal).
 * Quem chamar (action do painel, F5) DEVE antes chamar requireSession().
 */
export async function anonimizarLead(leadId: string, db = getDb()): Promise<void> {
  const [existe] = await db.select({ id: lead.id }).from(lead).where(eq(lead.id, leadId));
  if (!existe) throw new Error("lead não encontrado");
  const agora = new Date();
  await db.batch([
    db
      .update(lead)
      .set({ nome: "", whatsapp: "", negocio: "", mensagem: null, observacao: null, anonimizadoEm: agora, atualizadoEm: agora })
      .where(eq(lead.id, leadId)),
    db.update(consentEvents).set({ ipHmac: null, userAgent: null }).where(eq(consentEvents.leadId, leadId)),
    db.insert(auditLog).values({ acao: "anonimizar_lead", leadId, criadoEm: agora }),
  ]);
}
