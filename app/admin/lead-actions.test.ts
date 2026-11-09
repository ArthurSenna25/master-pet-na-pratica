// Com sessão simulada. Só toca em leads "zz-teste-"; no fim prova que NENHUM outro lead (ex.: "First Teste") mudou.
import { eq, like, not } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../_lib/session", () => ({ requireSession: async () => ({}) }));

import { getDb } from "../_lib/db";
import { auditLog, consentEvents, lead } from "../_lib/db/schema";
import { anonimizarLeadAction, atualizarLeadAction, excluirLeadAction } from "./lead-actions";

const PRE = "zz-teste-acoes-";
const db = getDb();
const ids: string[] = [];
let antes = "";

const form = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};
const redireciona = (p: Promise<unknown>) => expect(p).rejects.toThrow(/NEXT_REDIRECT/);
const outros = () => db.select().from(lead).where(not(like(lead.origem, "zz-teste-%"))).orderBy(lead.id);

async function novoLead(nome: string): Promise<string> {
  const [l] = await db
    .insert(lead)
    .values({ nome, whatsapp: "67999990010", cidadeUf: "Campo Grande/MS", negocio: `${PRE}Pet`, tempoFuncionamento: "1", pessoas: "1", maiorDesafio: "x", jaFezMentoria: false, mensagem: "oi", origem: `${PRE}${randomUUID()}` })
    .returning({ id: lead.id });
  await db.insert(consentEvents).values({ leadId: l.id, textoVersao: "t", textoHash: "h", origem: `${PRE}x`, ipHmac: "ip", userAgent: "ua" });
  ids.push(l.id);
  return l.id;
}

beforeAll(async () => { antes = JSON.stringify(await outros()); });
afterAll(async () => {
  for (const id of ids) await db.delete(auditLog).where(eq(auditLog.leadId, id));
  await db.delete(lead).where(like(lead.origem, `${PRE}%`));
  expect(JSON.stringify(await outros())).toBe(antes); // leads reais intactos
});

describe("atualizarLeadAction", () => {
  it("salva status e observação; observação vazia vira null", async () => {
    const id = await novoLead("Zz Atualiza");
    await redireciona(atualizarLeadAction(form({ id, status: "em_contato", observacao: "ligar amanhã" })));
    let [l] = await db.select().from(lead).where(eq(lead.id, id));
    expect([l.status, l.observacao]).toEqual(["em_contato", "ligar amanhã"]);
    await redireciona(atualizarLeadAction(form({ id, status: "convertido", observacao: "  " })));
    [l] = await db.select().from(lead).where(eq(lead.id, id));
    expect([l.status, l.observacao]).toEqual(["convertido", null]);
  });

  it("status inválido, observação de 2001 e id inválido não alteram nada", async () => {
    const id = await novoLead("Zz Invalido");
    await redireciona(atualizarLeadAction(form({ id, status: "ganho", observacao: "x" })));
    await redireciona(atualizarLeadAction(form({ id, status: "convertido", observacao: "a".repeat(2001) })));
    await redireciona(atualizarLeadAction(form({ id: "não-é-uuid", status: "convertido", observacao: "x" })));
    const [l] = await db.select().from(lead).where(eq(lead.id, id));
    expect([l.status, l.observacao]).toEqual(["novo", null]);
  });

  it("não edita lead anonimizado", async () => {
    const id = await novoLead("Zz Anon Edit");
    await redireciona(anonimizarLeadAction(form({ id, confirmar: "sim" })));
    await redireciona(atualizarLeadAction(form({ id, status: "convertido", observacao: "vazou?" })));
    const [l] = await db.select().from(lead).where(eq(lead.id, id));
    expect([l.status, l.observacao]).toEqual(["novo", null]);
  });
});

describe("anonimizarLeadAction", () => {
  it("sem confirmar=sim não faz nada; com confirmar zera dados e ip/ua", async () => {
    const id = await novoLead("Zz Anonimiza");
    await redireciona(anonimizarLeadAction(form({ id })));
    expect((await db.select().from(lead).where(eq(lead.id, id)))[0].nome).toBe("Zz Anonimiza");
    await redireciona(anonimizarLeadAction(form({ id, confirmar: "sim" })));
    const [l] = await db.select().from(lead).where(eq(lead.id, id));
    expect([l.nome, l.whatsapp, l.mensagem]).toEqual(["", "", null]);
    expect(l.anonimizadoEm).not.toBeNull();
    const [e] = await db.select().from(consentEvents).where(eq(consentEvents.leadId, id));
    expect([e.ipHmac, e.userAgent, e.textoHash]).toEqual([null, null, "h"]);
    expect((await db.select().from(auditLog).where(eq(auditLog.leadId, id))).map((a) => a.acao)).toEqual(["anonimizar_lead"]);
  });
});

describe("excluirLeadAction", () => {
  it("sem confirmar=sim não apaga", async () => {
    const id = await novoLead("Zz Nao Apaga");
    await redireciona(excluirLeadAction(form({ id })));
    await redireciona(excluirLeadAction(form({ id, confirmar: "talvez" })));
    expect(await db.select().from(lead).where(eq(lead.id, id))).toHaveLength(1);
  });

  it("com confirmar apaga lead e eventos (cascade) e grava excluir_lead sem dado pessoal", async () => {
    const id = await novoLead("Zz Exclui");
    await redireciona(excluirLeadAction(form({ id, confirmar: "sim" })));
    expect(await db.select().from(lead).where(eq(lead.id, id))).toHaveLength(0);
    expect(await db.select().from(consentEvents).where(eq(consentEvents.leadId, id))).toHaveLength(0);
    const a = await db.select().from(auditLog).where(eq(auditLog.leadId, id));
    expect(a.map((x) => x.acao)).toEqual(["excluir_lead"]);
    expect(Object.keys(a[0]).sort()).toEqual(["acao", "criadoEm", "id", "leadId"]);
  });

  it("id inexistente não grava auditoria", async () => {
    const fantasma = randomUUID();
    await redireciona(excluirLeadAction(form({ id: fantasma, confirmar: "sim" })));
    expect(await db.select().from(auditLog).where(eq(auditLog.leadId, fantasma))).toHaveLength(0);
  });
});
