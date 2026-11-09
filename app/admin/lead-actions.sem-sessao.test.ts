// Sem cookie: requireSession() REAL redireciona e a action não toca no banco. Só mexe em leads "zz-teste-".
import { eq, like } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

import { getDb } from "../_lib/db";
import { auditLog, consentEvents, lead } from "../_lib/db/schema";
import { anonimizarLeadAction, atualizarLeadAction, excluirLeadAction } from "./lead-actions";

const PRE = "zz-teste-semsessao-";
const db = getDb();
let id = "";

const form = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};

beforeAll(async () => {
  const [l] = await db
    .insert(lead)
    .values({ nome: "Zz Sem Sessao", whatsapp: "67999990009", cidadeUf: "Campo Grande/MS", negocio: `${PRE}Pet`, tempoFuncionamento: "1", pessoas: "1", maiorDesafio: "x", jaFezMentoria: false, origem: `${PRE}${randomUUID()}` })
    .returning({ id: lead.id });
  id = l.id;
  await db.insert(consentEvents).values({ leadId: id, textoVersao: "t", textoHash: "h", origem: `${PRE}x`, ipHmac: "ip", userAgent: "ua" });
});

afterAll(async () => {
  await db.delete(auditLog).where(eq(auditLog.leadId, id));
  await db.delete(lead).where(like(lead.origem, `${PRE}%`));
});

describe("actions do painel sem sessão", () => {
  it("todas são negadas (redirect) e o banco não muda", async () => {
    await expect(atualizarLeadAction(form({ id, status: "convertido", observacao: "invasão" }))).rejects.toThrow(/NEXT_REDIRECT/);
    await expect(anonimizarLeadAction(form({ id, confirmar: "sim" }))).rejects.toThrow(/NEXT_REDIRECT/);
    await expect(excluirLeadAction(form({ id, confirmar: "sim" }))).rejects.toThrow(/NEXT_REDIRECT/);

    const [l] = await db.select().from(lead).where(eq(lead.id, id));
    expect(l.nome).toBe("Zz Sem Sessao");
    expect(l.status).toBe("novo");
    expect(l.observacao).toBeNull();
    expect(l.anonimizadoEm).toBeNull();
    const ev = await db.select().from(consentEvents).where(eq(consentEvents.leadId, id));
    expect(ev).toHaveLength(1);
    expect(ev[0].ipHmac).toBe("ip");
    expect(await db.select().from(auditLog).where(eq(auditLog.leadId, id))).toHaveLength(0);
  });
});
