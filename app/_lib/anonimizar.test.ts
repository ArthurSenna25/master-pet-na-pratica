// Prova, no branch de TESTE, que o texto da confirmação de anonimizar (ConfirmacaoLgpd) bate com o que o código faz.
// Apagado: nome, negócio, WhatsApp, mensagem, observação, ip_hmac, user_agent. Mantido: cidade/UF, tempo, equipe, desafio, mentoria,
// status, datas, origem (lead e consentimento), texto_versao, texto_hash, aceito_em.
import { eq, like } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";
import { anonimizarLead } from "./anonimizar";
import { getDb } from "./db";
import { consentEvents, lead } from "./db/schema";

const PRE = "zz-teste-";
const db = getDb();
afterAll(async () => { await db.delete(lead).where(like(lead.origem, `${PRE}%`)); });

describe("anonimizarLead: o que a tela promete", () => {
  it("apaga o que diz que apaga e mantém o que diz que mantém", async () => {
    const aceitoEm = new Date("2031-05-05T12:00:00Z");
    const [l] = await db.insert(lead).values({
      nome: "Ana Prova", whatsapp: "67999990099", cidadeUf: "Lins/SP", negocio: `${PRE}Pet Prova`, tempoFuncionamento: "1 a 3 anos", pessoas: "2 a 3",
      maiorDesafio: "Equipe", jaFezMentoria: true, mensagem: "oi", status: "em_contato", observacao: "obs", origem: `${PRE}https://exemplo.test/p`,
    }).returning();
    await db.insert(consentEvents).values({ leadId: l.id, textoVersao: "0.2 de teste", textoHash: "hash-prova", aceitoEm, origem: `${PRE}https://exemplo.test/p`, ipHmac: "ip-hmac", userAgent: "ua" });

    await anonimizarLead(l.id);

    const [a] = await db.select().from(lead).where(eq(lead.id, l.id));
    expect([a.nome, a.negocio, a.whatsapp, a.mensagem, a.observacao]).toEqual(["", "", "", null, null]); // apagado
    expect(a.anonimizadoEm).not.toBeNull();
    expect([a.cidadeUf, a.tempoFuncionamento, a.pessoas, a.maiorDesafio, a.jaFezMentoria, a.status]).toEqual(["Lins/SP", "1 a 3 anos", "2 a 3", "Equipe", true, "em_contato"]); // mantido
    expect(a.origem).toBe(`${PRE}https://exemplo.test/p`); // origem do lead mantida
    expect(a.criadoEm.getTime()).toBe(l.criadoEm.getTime()); // datas mantidas

    const [e] = await db.select().from(consentEvents).where(eq(consentEvents.leadId, l.id));
    expect([e.ipHmac, e.userAgent]).toEqual([null, null]); // apagado
    expect([e.textoVersao, e.textoHash, e.aceitoEm.getTime(), e.origem]).toEqual(["0.2 de teste", "hash-prova", aceitoEm.getTime(), `${PRE}https://exemplo.test/p`]); // mantido
  });
});
