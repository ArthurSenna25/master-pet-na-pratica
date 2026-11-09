import { randomUUID } from "node:crypto";
import { eq, like } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";
import { getDb } from "../db";
import { lead } from "../db/schema";
import { escaparLike, lerParams, padraoTelefone, padraoTexto } from "./busca";
import { listarLeads, resumoPorStatus } from "./leads-query";

describe("busca", () => {
  it("escapa % _ e barra", () => expect(escaparLike("a%b_c\\d")).toBe("a\\%b\\_c\\\\d"));
  it("termo vazio ou só espaços não vira '%%'", () => {
    expect(padraoTexto("")).toBeNull();
    expect(padraoTexto("   ")).toBeNull();
  });
  it("telefone: sem dígitos ou com poucos dígitos não gera padrão", () => {
    expect(padraoTelefone("ana")).toBeNull();
    expect(padraoTelefone("%_%")).toBeNull();
    expect(padraoTelefone("12")).toBeNull();
    expect(padraoTelefone("(67) 99")).toBe("%6799%");
  });
  it("params inválidos caem no padrão", () => {
    expect(lerParams({ status: "x", ordem: "zz", pagina: "-3" })).toEqual({ q: "", status: undefined, ordem: "desc", pagina: 1 });
  });
});

const PRE = "zz-teste-busca-";
const db = getDb();
const base = (nome: string, whatsapp: string, negocio = `${PRE}negocio`) => ({
  nome, whatsapp, cidadeUf: "Campo Grande/MS", negocio, tempoFuncionamento: "1", pessoas: "1",
  maiorDesafio: "x", jaFezMentoria: false, origem: `${PRE}${randomUUID()}`,
});

describe("listarLeads (banco teste)", () => {
  afterAll(async () => { await db.delete(lead).where(like(lead.origem, `${PRE}%`)); });
  it("% e _ são literais; telefone por dígitos; filtro de status", async () => {
    await db.insert(lead).values([base("Ana Cem", "67999990001", `${PRE}Pet 100%`), base("Ana Cemx", "67999990002", `${PRE}Pet 100x`), base("Bia Sub", "67999990003", `${PRE}Pet_Sub`)]);
    const p = { q: "", ordem: "desc" as const, pagina: 1 };
    const r1 = await listarLeads({ ...p, q: "100%" });
    expect(r1.linhas.map((l) => l.nome)).toEqual(["Ana Cem"]);
    const r2 = await listarLeads({ ...p, q: "Pet_S" });
    expect(r2.linhas.map((l) => l.nome)).toEqual(["Bia Sub"]);
    const r3 = await listarLeads({ ...p, q: "99990002" });
    expect(r3.linhas.map((l) => l.nome)).toEqual(["Ana Cemx"]);
    await db.update(lead).set({ status: "convertido" }).where(eq(lead.id, r3.linhas[0].id));
    const r4 = await listarLeads({ ...p, q: PRE, status: "convertido" });
    expect(r4.linhas.map((l) => l.nome)).toEqual(["Ana Cemx"]);
    expect((await resumoPorStatus()).convertido).toBeGreaterThanOrEqual(1);
  });
});
