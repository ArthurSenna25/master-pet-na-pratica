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
    const antes = await carregarPerfil(db);
    const n0 = antes.find((g) => g.dim === "cidade")?.itens.find((i) => i.rotulo === "Zzteste/MS")?.n ?? 0;
    await db.insert(lead).values([
      { ...base, nome: "Ana Teste", cidadeUf: "Zzteste/MS", tempoFuncionamento: "1 a 3 anos", pessoas: "2 a 3", maiorDesafio: "Equipe", jaFezMentoria: true },
      { ...base, nome: "", negocio: "", whatsapp: "", cidadeUf: "Zzteste/MS", tempoFuncionamento: "1 a 3 anos", pessoas: "2 a 3", maiorDesafio: "Equipe", jaFezMentoria: false, anonimizadoEm: new Date() },
    ]);
    const depois = await carregarPerfil(db);
    expect(depois.find((g) => g.dim === "cidade")?.itens.find((i) => i.rotulo === "Zzteste/MS")?.n).toBe(n0 + 2);
    for (const g of depois) for (const i of g.itens) expect(Object.keys(i).sort()).toEqual(["n", "rotulo"]);
    expect(JSON.stringify(depois)).not.toContain("Ana Teste");
  });
});
