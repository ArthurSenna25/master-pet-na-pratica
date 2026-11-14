// Auditoria de injeção: varredura estática do código + busca real no banco (branch teste) com metacaracteres.
import { eq, like } from "drizzle-orm";
import { globSync, readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { listarLeads } from "./admin/leads-query";
import { celulaCsv } from "./admin/csv";
import { getDb } from "./db";
import { lead } from "./db/schema";
import { lerParams } from "./admin/busca";

const fontes = globSync("app/**/*.{ts,tsx}").filter((f) => !/\.test\.tsx?$/.test(f)).map((f) => [f.replaceAll("\\", "/"), readFileSync(f, "utf8")] as const);
const acha = (re: RegExp) => fontes.filter(([, s]) => re.test(s)).map(([f]) => f);

describe("varredura estática (app/, sem testes)", () => {
  it("nenhum dangerouslySetInnerHTML, innerHTML, eval ou new Function", () => {
    expect(acha(/dangerouslySetInnerHTML|\.innerHTML\s*=|\beval\(|new Function\(/)).toEqual([]);
  });
  it("nenhum sql.raw nem execute() com string pura", () => {
    expect(acha(/sql\.raw\(/)).toEqual([]);
    expect(acha(/\.execute\(\s*["'`]/)).toEqual([]);
  });
  it("nenhuma consulta monta SQL por concatenação de string", () => {
    expect(acha(/(select|insert into|update|delete from)\s[^`"']*["'`]\s*\+/i)).toEqual([]);
  });
  it("todo sql`` só interpola colunas/parâmetros (${...} nunca vindo direto de entrada: lista fechada de arquivos)", () => {
    expect(acha(/\bsql`/).sort()).toEqual([
      "app/_lib/admin/leads-query.ts", "app/_lib/admin/perfil-query.ts", "app/_lib/admin/tentativas.ts",
      "app/_lib/admin/visao-geral-query.ts", "app/_lib/db/schema.ts",
    ]);
  });
});

describe("busca do painel com metacaracteres", () => {
  const PRE = "zz-teste-inj-";
  const db = getDb();
  beforeAll(async () => {
    await db.insert(lead).values({ nome: "Zz Teste Injecao", whatsapp: "67999990123", cidadeUf: "Campo Grande/MS", negocio: `${PRE}Pet`, tempoFuncionamento: "1", pessoas: "1", maiorDesafio: "x", jaFezMentoria: false, origem: `${PRE}x` });
  });
  afterAll(async () => { await db.delete(lead).where(like(lead.origem, `${PRE}%`)); });

  const total = async (q: string) => (await listarLeads(lerParams({ q }), db)).total;
  it("% _ e \ são literais (não casam tudo)", async () => {
    for (const q of ["%", "_", "\\", "zz%injecao", "Zz_Teste", "Zz Teste\\"]) expect(await total(q), q).toBe(0);
  });
  it("busca normal ainda acha; telefone só com 3+ dígitos", async () => {
    expect(await total("zz teste inje")).toBe(1);
    expect(await total("99990123")).toBe(1);
    expect(await total("12")).toBe(0);
  });
  it("tentativas de injeção viram texto: sem erro, sem efeito", async () => {
    for (const q of ["'; drop table lead; --", "' or '1'='1", "\") or 1=1 --", "1; select pg_sleep(5)"]) expect(await total(q), q).toBe(0);
    expect((await db.select().from(lead).where(eq(lead.origem, `${PRE}x`))).length).toBe(1);
  });
});

describe("CSV neutraliza fórmula", () => {
  it.each(["=1+1", "+1", "-1", "@SOMA(A1)", "\t=1", "\r=1"])("%j ganha apóstrofo", (v) => {
    expect(celulaCsv(v).replace(/^"|"$/g, "").startsWith("'")).toBe(true);
  });
  it("texto comum fica intacto; aspas/vírgula/quebra são escapadas", () => {
    expect(celulaCsv("Maria")).toBe("Maria");
    expect(celulaCsv('a,"b"\nc')).toBe('"a,""b""\nc"');
  });
});
