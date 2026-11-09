// Banco teste. Só cria "zz-teste-"; remove o que criou. Os leads reais só passam pela memória (nenhum valor é impresso).
import { eq, like } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { anonimizarLead } from "../anonimizar";
import { getDb } from "../db";
import { adminEvents, auditLog, consentEvents, lead } from "../db/schema";
import { CABECALHO_LEADS, gerarCsvLeads } from "./leads-csv";

const PRE = "zz-teste-leadscsv-";
const db = getDb();
const ids: string[] = [];

async function novo(nome: string, extra: Partial<typeof lead.$inferInsert> = {}) {
  const [l] = await db
    .insert(lead)
    .values({ nome, whatsapp: "67999990055", cidadeUf: "Campo Grande/MS", negocio: `${PRE}Pet`, tempoFuncionamento: "1", pessoas: "1", maiorDesafio: "x", jaFezMentoria: false, origem: `${PRE}${randomUUID()}`, ...extra })
    .returning({ id: lead.id });
  ids.push(l.id);
  await db.insert(consentEvents).values({ leadId: l.id, textoVersao: "0.2", textoHash: "h", origem: `${PRE}o`, ipHmac: "IPHMAC-LC", userAgent: "UA-LC-AGENT" });
  return l.id;
}

afterAll(async () => {
  for (const id of ids) await db.delete(auditLog).where(eq(auditLog.leadId, id));
  await db.delete(lead).where(like(lead.origem, `${PRE}%`));
});

describe("gerarCsvLeads", () => {
  it("registra export_leads (sem lead_id), neutraliza fórmula, e anonimizado sai sem dado pessoal; sem ip/ua/consent", async () => {
    await novo("Zz Leads Ativo", { observacao: "=1+1", mensagem: "@cmd" });
    const idAnon = await novo("Zz Leads Anonimo", { observacao: "segredo-obs", mensagem: "segredo-msg" });
    await anonimizarLead(idAnon);

    const cont = async () => ({
      a: (await db.select().from(adminEvents)).filter((e) => e.acao === "export_leads").length,
      l: (await db.select().from(auditLog)).filter((e) => e.acao === "export_leads"),
    });
    const antes = await cont();
    const csv = await gerarCsvLeads();
    const depois = await cont();
    expect(depois.a).toBe(antes.a + 1);
    expect(depois.l).toHaveLength(antes.l.length + 1);
    expect(depois.l.every((e) => e.leadId === null)).toBe(true);

    const linhas = csv.replace(/^﻿/, "").split("\r\n");
    expect(linhas[0]).toBe(CABECALHO_LEADS.join(","));
    for (const proibido of ["IPHMAC-LC", "UA-LC-AGENT", "ip_hmac", "user_agent", "texto_hash", "consent"]) expect(csv).not.toContain(proibido);

    const ativo = linhas.find((l) => l.includes("Zz Leads Ativo"))!;
    expect(ativo).toContain("67999990055");
    expect(ativo).toContain("'=1+1");
    expect(ativo).toContain("'@cmd");
    expect(ativo).not.toMatch(/(^|,)[=@]/);

    const anon = linhas.find((l) => l.startsWith(idAnon))!;
    expect(anon).toBeDefined();
    for (const pessoal of ["Zz Leads Anonimo", "67999990055", "segredo-obs", "segredo-msg", `${PRE}Pet`, `${PRE}o`]) expect(anon).not.toContain(pessoal);
    expect(anon.split(",").slice(0, 3)).toEqual([idAnon, "", ""]);
  });
});
