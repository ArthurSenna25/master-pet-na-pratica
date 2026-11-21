// Contra o branch de TESTE do Neon. Limpa o que criou (origem zz-teste-).
import { randomUUID } from "node:crypto";
import { like } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";
import { getDb } from "../db";
import { lead } from "../db/schema";
import { carregarPerfil } from "./perfil-query";

const PRE = "zz-teste-";
const db = getDb();
const base = { whatsapp: "67999990000", negocio: `${PRE}Pet`, status: "novo", origem: `${PRE}${randomUUID()}` };
afterAll(async () => { await db.delete(lead).where(like(lead.origem, `${PRE}%`)); });

describe("carregarPerfil (uma query agregada, sem dado pessoal)", () => {
  it("conta anonimizados e devolve só rótulo + contagem", async () => {
    const antes = await carregarPerfil(undefined, db);
    const n0 = antes.find((g) => g.dim === "cidade")?.itens.find((i) => i.rotulo === "Zzteste/MS")?.n ?? 0;
    await db.insert(lead).values([
      { ...base, nome: "Ana Teste", cidadeUf: "Zzteste/MS", tempoFuncionamento: "1 a 3 anos", pessoas: "2 a 3", maiorDesafio: "Equipe", jaFezMentoria: true },
      { ...base, nome: "", negocio: "", whatsapp: "", cidadeUf: "Zzteste/MS", tempoFuncionamento: "1 a 3 anos", pessoas: "2 a 3", maiorDesafio: "Equipe", jaFezMentoria: false, anonimizadoEm: new Date() },
    ]);
    const depois = await carregarPerfil(undefined, db);
    expect(depois.find((g) => g.dim === "cidade")?.itens.find((i) => i.rotulo === "Zzteste/MS")?.n).toBe(n0 + 2);
    for (const g of depois) for (const i of g.itens) expect(Object.keys(i).sort()).toEqual(["n", "rotulo"]);
    expect(JSON.stringify(depois)).not.toContain("Ana Teste");
  });

  it("filtro por campanha isola: só mentoria entra / sai", async () => {
    const cidade = (g: Awaited<ReturnType<typeof carregarPerfil>>) => g.find((x) => x.dim === "cidade")?.itens.find((i) => i.rotulo === "Zzfiltro/MS")?.n ?? 0;
    const v = { ...base, cidadeUf: "Zzfiltro/MS", tempoFuncionamento: "1 a 3 anos", pessoas: "2 a 3", maiorDesafio: "Equipe" };
    await db.insert(lead).values([{ ...v, nome: "Cris Teste", jaFezMentoria: null, campanha: "mentoria" }, { ...v, nome: "Dan Teste", jaFezMentoria: false }]);
    expect(cidade(await carregarPerfil("mentoria", db))).toBe(1);
    expect(cidade(await carregarPerfil("presencial", db))).toBe(1);
    expect(cidade(await carregarPerfil(undefined, db))).toBe(2);
  });

  it("ja_fez_mentoria nulo (mentoria) vira 'Não perguntado', não 'Não'", async () => {
    const n = async () => (await carregarPerfil(undefined, db)).find((g) => g.dim === "mentoria")?.itens.find((i) => i.rotulo === "Não perguntado")?.n ?? 0;
    const n0 = await n();
    await db.insert(lead).values({ ...base, nome: "Bia Teste", cidadeUf: "Zzteste/MS", tempoFuncionamento: "1 a 3 anos", pessoas: "2 a 3", maiorDesafio: "Equipe", jaFezMentoria: null, campanha: "mentoria" });
    expect(await n()).toBe(n0 + 1);
  });
});
