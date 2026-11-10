// 3ª camada de validação: CHECKs e triggers do Postgres, testados direto no branch "teste". Leads com negocio "zz-teste-..." e limpeza em afterEach.
import { neon } from "@neondatabase/serverless";
import { afterEach, describe, expect, it } from "vitest";

const sql = neon(process.env.DATABASE_URL ?? "");
const NEG = "zz-teste-constraints";

interface Over { nome?: string; whatsapp?: string; cidade_uf?: string; negocio?: string; status?: string; mensagem?: string | null }

async function inserir(o: Over = {}): Promise<string> {
  const v = { nome: "Maria", whatsapp: "14999990001", cidade_uf: "Lins/SP", negocio: NEG, status: "novo", mensagem: null, ...o };
  const [r] = await sql`insert into lead (nome, whatsapp, cidade_uf, negocio, tempo_funcionamento, pessoas, maior_desafio, ja_fez_mentoria, status, mensagem, origem)
    values (${v.nome}, ${v.whatsapp}, ${v.cidade_uf}, ${v.negocio}, 't', 'p', 'd', true, ${v.status}, ${v.mensagem}, 'http://localhost/zz-teste') returning id`;
  return r.id as string;
}

async function rejeita(o: Over, constraint: string) {
  await expect(inserir(o)).rejects.toThrow(constraint);
}

afterEach(async () => {
  await sql`delete from lead where negocio like ${NEG + "%"}`;
});

describe("CHECKs de lead", () => {
  it.each(["José", "Conceição", "D'Ávila", "Ana-Maria", "Dr. Silva", "Åsa"])("aceita o nome %s", async (nome) => {
    expect(await inserir({ nome })).toBeTruthy();
  });

  it.each([["Ana123"], ["A"], ["  "], ["Ana_"], ["-Ana"], ["a".repeat(81)], ["Ana@x"]])("rejeita o nome %j", async (nome) => {
    await rejeita({ nome }, "lead_nome_ck");
  });

  it.each([["123"], ["1499999000a"], ["149999900011"], ["(14) 99999-0001"]])("rejeita whatsapp %j", async (whatsapp) => {
    await rejeita({ whatsapp }, "lead_whatsapp_ck");
  });

  it.each([["Lins"], ["Lins/XX"], ["lins/sp"], ["Lins/SP/RJ"], ["Li1ns/SP"], ["/SP"]])("rejeita cidade_uf %j", async (cidade_uf) => {
    await rejeita({ cidade_uf }, "lead_cidade_uf_ck");
  });

  it("aceita cidade com acento e apóstrofo", async () => {
    expect(await inserir({ cidade_uf: "Conceição do Araguaia/PA" })).toBeTruthy();
    expect(await inserir({ cidade_uf: "Santa Bárbara d'Oeste/SP" })).toBeTruthy();
  });

  it("rejeita status fora do enum, negócio sem letra e mensagem longa", async () => {
    await rejeita({ status: "inventado" }, "lead_status_ck");
    await rejeita({ negocio: "!!" }, "lead_negocio_ck");
    await rejeita({ mensagem: "x".repeat(1001), negocio: NEG }, "lead_mensagem_ck");
  });

  it("lead anonimizado (nome/whatsapp/negócio vazios) continua permitido", async () => {
    const id = await inserir();
    await sql`update lead set nome = '', whatsapp = '', negocio = ${NEG + "-anon"}, anonimizado_em = now() where id = ${id}`;
    const [r] = await sql`select nome, anonimizado_em from lead where id = ${id}`;
    expect(r.nome).toBe("");
    expect(r.anonimizado_em).toBeTruthy();
    await expect(sql`update lead set nome = '' where id = ${id}`).resolves.toBeDefined();
  });
});

describe("trigger lead.atualizado_em", () => {
  it("UPDATE sempre renova atualizado_em", async () => {
    const id = await inserir();
    await sql`update lead set atualizado_em = '2020-01-01T00:00:00Z' where id = ${id}`; // o trigger sobrescreve até isto
    const [a] = await sql`select atualizado_em from lead where id = ${id}`;
    expect(new Date(a.atualizado_em).getFullYear()).toBeGreaterThanOrEqual(2026);
    const antes = new Date(a.atualizado_em).getTime();
    await new Promise((r) => setTimeout(r, 30));
    await sql`update lead set observacao = 'ligar amanhã' where id = ${id}`;
    const [b] = await sql`select atualizado_em from lead where id = ${id}`;
    expect(new Date(b.atualizado_em).getTime()).toBeGreaterThan(antes);
  });
});

describe("trigger consent_events (colunas de prova imutáveis)", () => {
  async function comEvento() {
    const id = await inserir();
    const outro = await inserir();
    const [e] = await sql`insert into consent_events (lead_id, tipo, texto_versao, texto_hash, origem, user_agent, ip_hmac)
      values (${id}, 'aceite', '0.2 de 2026-11-08', 'hash-original', 'http://localhost/zz-teste', 'UA', 'hmac') returning id`;
    return { id, outro, evento: e.id as string };
  }

  it.each([
    ["texto_hash", (e: string) => sql`update consent_events set texto_hash = 'outro' where id = ${e}`],
    ["texto_versao", (e: string) => sql`update consent_events set texto_versao = '9.9' where id = ${e}`],
    ["aceito_em", (e: string) => sql`update consent_events set aceito_em = now() - interval '1 day' where id = ${e}`],
    ["tipo", (e: string) => sql`update consent_events set tipo = 'revogacao' where id = ${e}`],
    ["origem", (e: string) => sql`update consent_events set origem = 'x' where id = ${e}`],
    ["ip_hmac para outro valor", (e: string) => sql`update consent_events set ip_hmac = 'forjado' where id = ${e}`],
  ])("bloqueia UPDATE de %s", async (_nome, atualizar) => {
    const { evento } = await comEvento();
    await expect(atualizar(evento)).rejects.toThrow(/imutáveis|só podem ser zerados/);
  });

  it("bloqueia trocar lead_id", async () => {
    const { evento, outro } = await comEvento();
    await expect(sql`update consent_events set lead_id = ${outro} where id = ${evento}`).rejects.toThrow(/imutáveis/);
  });

  it("permite zerar ip_hmac e user_agent (anonimização) sem tocar nas provas", async () => {
    const { evento } = await comEvento();
    await sql`update consent_events set ip_hmac = null, user_agent = null where id = ${evento}`;
    const [e] = await sql`select ip_hmac, user_agent, texto_hash, texto_versao from consent_events where id = ${evento}`;
    expect([e.ip_hmac, e.user_agent]).toEqual([null, null]);
    expect([e.texto_hash, e.texto_versao]).toEqual(["hash-original", "0.2 de 2026-11-08"]);
  });

  it("ON DELETE CASCADE continua funcionando", async () => {
    const { id, evento } = await comEvento();
    await sql`delete from lead where id = ${id}`;
    expect(await sql`select 1 from consent_events where id = ${evento}`).toHaveLength(0);
  });
});

describe("CHECK de e-mail em user (migração 0006)", () => {
  const tenta = (email: string) =>
    sql.transaction([sql`insert into "user" (id, name, email, email_verified) values (${"zz-teste-" + Math.random()}, 'zz', ${email}, false)`]);
  it.each(["sem-arroba", "A@B.com", "a@b", "a b@c.com", "a".repeat(250) + "@x.com"])("rejeita %j", async (email) => {
    await expect(tenta(email)).rejects.toThrow("user_email_ck");
  });
});
