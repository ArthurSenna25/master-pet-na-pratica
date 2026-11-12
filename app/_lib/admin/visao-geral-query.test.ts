// Contra o branch de TESTE do Neon. Janela em 2031 (sem lead real); status e total por diferença. Limpa o que criou (origem zz-teste-).
import { randomUUID } from "node:crypto";
import { like } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";
import { getDb } from "../db";
import { lead } from "../db/schema";
import { carregarVisaoGeral } from "./visao-geral-query";

const PRE = "zz-teste-";
const db = getDb();
const base = { whatsapp: "67999990000", cidadeUf: "Campo Grande/MS", tempoFuncionamento: "1 a 3 anos", pessoas: "2 a 3", maiorDesafio: "x", jaFezMentoria: false };
const novo = (criadoEm: string, status = "novo") => ({ ...base, nome: "Ana Teste", negocio: `${PRE}Pet`, status, criadoEm: new Date(criadoEm), origem: `${PRE}${randomUUID()}` });

afterAll(async () => { await db.delete(lead).where(like(lead.origem, `${PRE}%`)); });

describe("carregarVisaoGeral", () => {
  it("hoje/semana no fuso de SP, 7 dias e 48 h no relógio do servidor, semanas vazias com 0", async () => {
    // agora = quarta 2031-03-12 15:00Z (12:00 em SP); a segunda da semana é 2031-03-10.
    const agora = new Date("2031-03-12T15:00:00Z");
    const antes = await carregarVisaoGeral(agora);
    await db.insert(lead).values([
      novo("2031-03-10T02:59:59Z"),               // A: domingo 23:59:59 em SP -> semana de 03/03; >48 h
      novo("2031-03-10T03:00:00Z"),               // B: segunda 00:00 em SP -> semana de 10/03; >48 h
      novo("2031-03-12T03:00:00Z", "convertido"), // C: quarta 00:00 em SP = hoje
      novo("2031-03-12T02:59:59Z"),               // D: terça 23:59:59 em SP: não é hoje; <48 h
      novo("2031-03-05T15:00:00Z"),               // E: exatamente 7 dias (entra, >=) -> semana de 03/03; >48 h
    ]);
    const d = await carregarVisaoGeral(agora);
    expect(d.hoje - antes.hoje).toBe(1);
    expect(d.seteDias - antes.seteDias).toBe(5);
    expect(d.novosHaMaisDe48h - antes.novosHaMaisDe48h).toBe(3);
    expect(d.porStatus.convertido - antes.porStatus.convertido).toBe(1);
    expect(d.porStatus.novo - antes.porStatus.novo).toBe(4);
    expect(d.total - antes.total).toBe(5);
    const sem = Object.fromEntries(d.semanas.map((s) => [s.semana, s.n]));
    expect(d.semanas).toHaveLength(12);
    expect(sem["2031-03-03"]).toBe(2);
    expect(sem["2031-03-10"]).toBe(3);
    expect(sem["2031-02-24"]).toBe(0);
  });

  it("para chamar: no máximo 5, só 'novo', mais antigos primeiro", async () => {
    const { chamar } = await carregarVisaoGeral();
    expect(chamar.length).toBeLessThanOrEqual(5);
    const t = chamar.map((c) => c.criadoEm.getTime());
    expect(t).toEqual([...t].sort((a, b) => a - b));
  });
});
