// F10 c2: duas campanhas sobre processarEnvio. Contra o branch "teste" do Neon; tudo com prefixo "zz-teste-", removido em afterEach.
import { and, count, eq, gt, inArray, like } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let ipAtual = "203.0.113.20";
let refererAtual = "http://localhost/zz-teste";
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": ipAtual, "user-agent": "zz-teste-agent", referer: refererAtual }),
}));

import { getDb } from "./db";
import { auditLog, consentEvents, lead, rateLimitEnvio } from "./db/schema";
import { enviarLeadMentoria, enviarLeadPresencial } from "./lead-action";
import { CONSENTIMENTOS, LEGAL_TEXT_VERSION } from "./legal-version";
import { ipHmac, sha256Hex } from "./seguranca";

const PREFIXO = "zz-teste-";
const FILLER = `${PREFIXO}teto-`;
const db = getDb();
const ips = new Set<string>();
const letras = (n = 8) => Array.from({ length: n }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join("");

function novoIp() {
  ipAtual = `203.0.113.${20 + Math.floor(Math.random() * 230)}`;
  ips.add(ipAtual);
}

function form(base: Record<string, string>, extra: Record<string, string> = {}): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries({ ...base, ...extra })) f.set(k, v);
  return f;
}

const presencial = (extra: Record<string, string> = {}) =>
  form({ nome: `${PREFIXO}${letras()}`, whatsapp: "(14) 99999-0000", cidade: "Lins/SP", negocio: `${PREFIXO}neg`, tempo: "1 a 3 anos", equipe: "2 a 3", desafio: "Equipe", curso: "Sim", consentimento: "on", site: "" }, extra);
const mentoria = (extra: Record<string, string> = {}) =>
  form({ nome: `${PREFIXO}${letras()}`, whatsapp: "(14) 99999-0000", cidade: "Lins/SP", negocio: `${PREFIXO}neg`, tempo: "1-3", equipe: "2-3", desafio: "equipe", consentimento: "on", site: "" }, extra);

async function ultimo() {
  const [l] = await db.select().from(lead).where(like(lead.negocio, `${PREFIXO}%`)).orderBy(lead.criadoEm).limit(1000).then((r) => r.slice(-1));
  const [e] = await db.select().from(consentEvents).where(eq(consentEvents.leadId, l.id));
  return { l, e };
}

async function limpar() {
  const ids = (await db.select({ id: lead.id }).from(lead).where(like(lead.negocio, `${PREFIXO}%`))).map((r) => r.id);
  if (ids.length) {
    await db.delete(auditLog).where(inArray(auditLog.leadId, ids));
    await db.delete(lead).where(inArray(lead.id, ids));
  }
  for (const ip of ips) await db.delete(rateLimitEnvio).where(eq(rateLimitEnvio.ipHmac, ipHmac(ip)));
  await db.delete(rateLimitEnvio).where(like(rateLimitEnvio.ipHmac, `${FILLER}%`));
}

beforeEach(async () => { await limpar(); refererAtual = "http://localhost/zz-teste"; novoIp(); });
afterEach(limpar);

describe("campanha fixada no servidor", () => {
  it("presencial: campanha, curso e hash do texto presencial", async () => {
    expect(await enviarLeadPresencial({}, presencial())).toEqual({ ok: true });
    const { l, e } = await ultimo();
    expect(l.campanha).toBe("presencial");
    expect(l.jaFezMentoria).toBe(true);
    expect(l.origemCampanha).toBeNull();
    expect(e.textoVersao).toBe(LEGAL_TEXT_VERSION);
    expect(e.textoHash).toBe(sha256Hex(CONSENTIMENTOS.presencial));
  });

  it("mentoria: campanha, rótulos mapeados, ja_fez nulo, sem mensagem e hash do texto da mentoria", async () => {
    expect(await enviarLeadMentoria({}, mentoria())).toEqual({ ok: true });
    const { l, e } = await ultimo();
    expect(l.campanha).toBe("mentoria");
    expect([l.tempoFuncionamento, l.pessoas, l.maiorDesafio]).toEqual(["1 a 3 anos", "2 a 3", "Equipe"]);
    expect(l.jaFezMentoria).toBeNull();
    expect(l.mensagem).toBeNull();
    expect(e.textoVersao).toBe(LEGAL_TEXT_VERSION);
    expect(e.textoHash).toBe(sha256Hex(CONSENTIMENTOS.mentoria));
    expect(sha256Hex(CONSENTIMENTOS.mentoria)).not.toBe(sha256Hex(CONSENTIMENTOS.presencial));
  });

  it("campo extra ou oculto `campanha` no POST é ignorado nas duas actions", async () => {
    await enviarLeadPresencial({}, presencial({ campanha: "mentoria", origem_campanha: "natal" }));
    let r = await ultimo();
    expect(r.l.campanha).toBe("presencial");
    expect(r.l.origemCampanha).toBeNull();
    expect(r.e.textoHash).toBe(sha256Hex(CONSENTIMENTOS.presencial));
    await limpar(); novoIp();
    await enviarLeadMentoria({}, mentoria({ campanha: "presencial", curso: "Sim", mensagem: "oi" }));
    r = await ultimo();
    expect(r.l.campanha).toBe("mentoria");
    expect(r.l.jaFezMentoria).toBeNull();
    expect(r.l.mensagem).toBeNull();
    expect(r.e.textoHash).toBe(sha256Hex(CONSENTIMENTOS.mentoria));
  });

  it("código de opção da mentoria inválido: erro por campo, nada gravado", async () => {
    const r = await enviarLeadMentoria({}, mentoria({ tempo: "1 a 3 anos", desafio: "x" }));
    expect(Object.keys(r.errors ?? {}).sort()).toEqual(["desafio", "tempo"]);
    expect((await db.select().from(lead).where(like(lead.negocio, `${PREFIXO}%`))).length).toBe(0);
  });
});

describe("origem", () => {
  it("lead.origem e consent_events.origem guardam só host e caminho (sem query nem fragmento)", async () => {
    refererAtual = "https://mentoria-master-pet.vercel.app/mentoria?origem=natal&email=a@b.c#form";
    await enviarLeadMentoria({}, mentoria({ origem_campanha: "natal" }));
    const { l, e } = await ultimo();
    expect(l.origem).toBe("mentoria-master-pet.vercel.app/mentoria");
    expect(e.origem).toBe("mentoria-master-pet.vercel.app/mentoria");
    expect(l.origem + e.origem).not.toMatch(/[?#=@]/);
    expect(l.origemCampanha).toBe("natal");
  });

  it.each([["Natal", "natal"], ["ig_bio-1", "ig_bio-1"], ["-x", null], ["a b", null], ["x".repeat(41), null], ["<b>", null], ["", null]])(
    "origem_campanha %j vira %j e o envio não falha",
    async (entrada, esperado) => {
      expect(await enviarLeadMentoria({}, mentoria({ origem_campanha: entrada }))).toEqual({ ok: true });
      expect((await ultimo()).l.origemCampanha).toBe(esperado);
    },
  );
});

describe("teto global por campanha", () => {
  it("teto da mentoria atingido não bloqueia o presencial (e bloqueia a própria mentoria)", async () => {
    const hora = gt(rateLimitEnvio.criadoEm, new Date(Date.now() - 3600_000));
    const n = async (c: "presencial" | "mentoria") => (await db.select({ n: count() }).from(rateLimitEnvio).where(and(eq(rateLimitEnvio.campanha, c), hora)))[0].n;
    const [nP, nM] = [await n("presencial"), await n("mentoria")];
    const teto = Math.max(nP, nM) + 2;
    process.env.TETO_GLOBAL_TESTE = String(teto);
    try {
      await db.insert(rateLimitEnvio).values(Array.from({ length: teto - nM }, (_, i) => ({ ipHmac: `${FILLER}${i}`, campanha: "mentoria" })));
      const bloqueada = await enviarLeadMentoria({}, mentoria());
      expect(bloqueada.ok).toBeUndefined();
      expect(bloqueada.message).toMatch(/Muitos envios/);
      expect((await db.select().from(lead).where(like(lead.negocio, `${PREFIXO}%`))).length).toBe(0);
      novoIp();
      expect(await enviarLeadPresencial({}, presencial())).toEqual({ ok: true });
      expect((await ultimo()).l.campanha).toBe("presencial");
    } finally {
      delete process.env.TETO_GLOBAL_TESTE;
    }
  });

  it("limite por IP vale entre campanhas (5 em 10 min no mesmo IP)", async () => {
    for (let i = 0; i < 3; i++) expect((await enviarLeadPresencial({}, presencial())).ok).toBe(true);
    for (let i = 0; i < 2; i++) expect((await enviarLeadMentoria({}, mentoria())).ok).toBe(true);
    const sexto = await enviarLeadMentoria({}, mentoria());
    expect(sexto.ok).toBeUndefined();
    expect(sexto.message).toMatch(/Muitos envios/);
  });
});
