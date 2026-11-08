// Testes contra o branch "teste" do Neon. Tudo que criam tem prefixo "zz-teste-" e é removido em finally/afterEach.
import { eq, like, inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let ipAtual = "203.0.113.1";
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": ipAtual, "user-agent": "zz-teste-agent", referer: "http://localhost/zz-teste" }),
}));

import { anonimizarLead } from "./anonimizar";
import { getDb } from "./db";
import { auditLog, consentEvents, lead, rateLimitEnvio } from "./db/schema";
import { enviarLead } from "./lead-action";
import { CONSENT_TEXT, LEGAL_TEXT_VERSION } from "./legal-version";
import { ipHmac, sha256Hex } from "./seguranca";

const PREFIXO = "zz-teste-";
const db = getDb();
const ipsUsados = new Set<string>();

function novoIp(): string {
  ipAtual = `203.0.113.${1 + Math.floor(Math.random() * 250)}`;
  ipsUsados.add(ipAtual);
  return ipAtual;
}

function form(over: Record<string, string> = {}): FormData {
  const base: Record<string, string> = {
    nome: `${PREFIXO}${randomUUID().slice(0, 8)}`,
    whatsapp: "(14) 99999-0000",
    cidade: "Lins/SP",
    negocio: `${PREFIXO}negocio`,
    tempo: "1 a 3 anos",
    equipe: "2 a 3",
    desafio: "Equipe",
    curso: "Sim",
    consentimento: "on",
    site: "",
    ...over,
  };
  const f = new FormData();
  for (const [k, v] of Object.entries(base)) f.set(k, v);
  return f;
}

async function limpar() {
  const ids = (await db.select({ id: lead.id }).from(lead).where(like(lead.nome, `${PREFIXO}%`))).map((r) => r.id);
  const orfaos = (await db.select({ id: lead.id }).from(lead).where(like(lead.negocio, `${PREFIXO}%`))).map((r) => r.id);
  const todos = [...new Set([...ids, ...orfaos])];
  if (todos.length) {
    await db.delete(auditLog).where(inArray(auditLog.leadId, todos));
    await db.delete(lead).where(inArray(lead.id, todos)); // consent_events sai por cascade
  }
  for (const ip of ipsUsados) await db.delete(rateLimitEnvio).where(eq(rateLimitEnvio.ipHmac, ipHmac(ip)));
}

const contarLeads = async () => (await db.select().from(lead).where(like(lead.nome, `${PREFIXO}%`))).length;

beforeEach(async () => {
  await limpar();
  novoIp();
});
afterEach(limpar);

describe("anonimizarLead", () => {
  it("zera dados pessoais, preserva versão/hash/data e grava audit_log", async () => {
    const leadId = randomUUID();
    const aceitoEm = new Date("2026-11-07T12:00:00Z");
    try {
      await db.insert(lead).values({
        id: leadId, nome: `${PREFIXO}Fulana`, whatsapp: "14999990000", cidadeUf: "Lins/SP", negocio: `${PREFIXO}Pet`,
        tempoFuncionamento: "1 a 3 anos", pessoas: "2 a 3", maiorDesafio: "Equipe", jaFezMentoria: true,
        mensagem: "texto pessoal", observacao: "obs pessoal", origem: "http://localhost/zz-teste",
      });
      await db.insert(consentEvents).values({
        leadId, tipo: "aceite", textoVersao: "9.9 de 2026-01-01", textoHash: "hash-fixo", aceitoEm,
        origem: "http://localhost/zz-teste", userAgent: "UA-pessoal", ipHmac: "hmac-pessoal",
      });

      await anonimizarLead(leadId);

      const [l] = await db.select().from(lead).where(eq(lead.id, leadId));
      expect([l.nome, l.whatsapp, l.negocio]).toEqual(["", "", ""]);
      expect([l.mensagem, l.observacao]).toEqual([null, null]);
      expect(l.anonimizadoEm).toBeInstanceOf(Date);
      expect([l.cidadeUf, l.status, l.tempoFuncionamento]).toEqual(["Lins/SP", "novo", "1 a 3 anos"]);

      const [e] = await db.select().from(consentEvents).where(eq(consentEvents.leadId, leadId));
      expect([e.ipHmac, e.userAgent]).toEqual([null, null]);
      expect(e.textoVersao).toBe("9.9 de 2026-01-01");
      expect(e.textoHash).toBe("hash-fixo");
      expect(e.aceitoEm.toISOString()).toBe(aceitoEm.toISOString());

      const log = await db.select().from(auditLog).where(eq(auditLog.leadId, leadId));
      expect(log).toHaveLength(1);
      expect(log[0].acao).toBe("anonimizar_lead");
    } finally {
      await db.delete(auditLog).where(eq(auditLog.leadId, leadId));
      await db.delete(lead).where(eq(lead.id, leadId));
    }
  });

  it("lead inexistente: erro e nenhum audit_log", async () => {
    const id = randomUUID();
    await expect(anonimizarLead(id)).rejects.toThrow();
    expect(await db.select().from(auditLog).where(eq(auditLog.leadId, id))).toHaveLength(0);
  });
});

describe("enviarLead", () => {
  it("grava lead + consent_events (versão, hash do texto, ip só como HMAC)", async () => {
    const r = await enviarLead({}, form({ nome: `${PREFIXO}ok` }));
    expect(r).toEqual({ ok: true });
    const [l] = await db.select().from(lead).where(eq(lead.nome, `${PREFIXO}ok`));
    expect(l.whatsapp).toBe("14999990000");
    expect(l.jaFezMentoria).toBe(true);
    const [e] = await db.select().from(consentEvents).where(eq(consentEvents.leadId, l.id));
    expect(e.tipo).toBe("aceite");
    expect(e.textoVersao).toBe(LEGAL_TEXT_VERSION);
    expect(e.textoHash).toBe(sha256Hex(CONSENT_TEXT));
    expect(e.ipHmac).toBe(ipHmac(ipAtual));
    expect(e.ipHmac).not.toContain(ipAtual);
  });

  it("entrada inválida: erro por campo e nada gravado", async () => {
    const r = await enviarLead({}, form({ nome: "", tempo: "x", consentimento: "" }));
    expect(r.ok).toBeUndefined();
    expect(Object.keys(r.errors ?? {}).sort()).toEqual(["consentimento", "nome", "tempo"]);
    expect(r.values?.consentimento).toBeUndefined();
    expect(await contarLeads()).toBe(0);
  });

  it("honeypot preenchido: sucesso genérico e nada gravado", async () => {
    const r = await enviarLead({}, form({ site: "http://spam", nome: `${PREFIXO}bot` }));
    expect(r).toEqual({ ok: true });
    expect(await contarLeads()).toBe(0);
  });

  it("6º envio do mesmo IP em 10 min é bloqueado", async () => {
    for (let i = 0; i < 5; i++) expect((await enviarLead({}, form())).ok).toBe(true);
    const sexto = await enviarLead({}, form());
    expect(sexto.ok).toBeUndefined();
    expect(sexto.message).toMatch(/Muitos envios/);
    expect(await contarLeads()).toBe(5);
    novoIp(); // outro IP não é afetado
    expect((await enviarLead({}, form())).ok).toBe(true);
  });

  it("apaga linhas de rate_limit com mais de 24 h a cada novo envio", async () => {
    const velho = ipHmac("203.0.113.250");
    await db.insert(rateLimitEnvio).values({ ipHmac: velho, criadoEm: new Date(Date.now() - 25 * 3600 * 1000) });
    try {
      expect((await enviarLead({}, form())).ok).toBe(true);
      expect(await db.select().from(rateLimitEnvio).where(eq(rateLimitEnvio.ipHmac, velho))).toHaveLength(0);
    } finally {
      await db.delete(rateLimitEnvio).where(eq(rateLimitEnvio.ipHmac, velho));
    }
  });
});
