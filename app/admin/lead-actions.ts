"use server";
import { and, eq, isNull } from "drizzle-orm";
import { redirect, RedirectType } from "next/navigation";
import { anonimizarLead } from "../_lib/anonimizar";
import { confirmaSchema, editSchema, idSchema } from "../_lib/admin/lead-edit";
import { getDb } from "../_lib/db";
import { auditLog, lead } from "../_lib/db/schema";
import { requireSession } from "../_lib/session";

const detalhe = (id: string, q: string) => `/admin/lead/${id}?${q}`;
// replace: salvar/anonimizar não empilha histórico, então "Fechar" (voltar) no modal volta à lista com os filtros.
const irAoDetalhe = (id: string, q: string): never => redirect(detalhe(id, q), RedirectType.replace);

/** RF-07. requireSession() ANTES de qualquer outra coisa. */
export async function atualizarLeadAction(form: FormData): Promise<void> {
  await requireSession();
  const parsed = editSchema.safeParse({ id: form.get("id"), status: form.get("status"), observacao: form.get("observacao") ?? "" });
  if (!parsed.success) {
    const id = idSchema.safeParse({ id: form.get("id") });
    if (id.success) irAoDetalhe(id.data.id, "erro=dados");
    redirect("/admin");
  }
  const { id, status, observacao } = parsed.data;
  const alterados = await getDb()
    .update(lead)
    .set({ status, observacao })
    .where(and(eq(lead.id, id), isNull(lead.anonimizadoEm)))
    .returning({ id: lead.id });
  if (alterados.length) irAoDetalhe(id, "ok=salvo");
  redirect("/admin");
}

/** RF-14. Só roda com confirmar=sim (campo do formulário do 2º passo). audit_log + DELETE na mesma transação. */
export async function excluirLeadAction(form: FormData): Promise<void> {
  await requireSession();
  const parsed = confirmaSchema.safeParse({ id: form.get("id"), confirmar: form.get("confirmar") });
  if (!parsed.success) redirect("/admin");
  const { id } = parsed.data;
  const db = getDb();
  const [existe] = await db.select({ id: lead.id }).from(lead).where(eq(lead.id, id));
  if (existe) {
    await db.batch([
      db.insert(auditLog).values({ acao: "excluir_lead", leadId: id }),
      db.delete(lead).where(eq(lead.id, id)), // consent_events saem por cascade
    ]);
  }
  redirect("/admin?ok=excluido");
}

/** RF-14. Zera dados pessoais e ip_hmac/user_agent dos eventos; mantém a prova do consentimento. */
export async function anonimizarLeadAction(form: FormData): Promise<void> {
  await requireSession();
  const parsed = confirmaSchema.safeParse({ id: form.get("id"), confirmar: form.get("confirmar") });
  if (!parsed.success) redirect("/admin");
  const { id } = parsed.data;
  const [existe] = await getDb().select({ id: lead.id }).from(lead).where(eq(lead.id, id));
  if (!existe) redirect("/admin");
  await anonimizarLead(id);
  irAoDetalhe(id, "ok=anonimizado");
}
