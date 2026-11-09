// Banco teste. Só cria "zz-teste-"; remove o que criou. Nenhum lead real é tocado.
import { eq, like } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { getDb } from "../db";
import { adminEvents, auditLog, consentEvents, lead } from "../db/schema";
import { CABECALHO_AUDITORIA, gerarCsvAuditoria } from "./auditoria";

const PRE = "zz-teste-audit-";
const db = getDb();
const ids: string[] = [];

afterAll(async () => {
  for (const id of ids) await db.delete(auditLog).where(eq(auditLog.leadId, id));
  await db.delete(lead).where(like(lead.origem, `${PRE}%`));
});

describe("gerarCsvAuditoria", () => {
  it("registra o próprio export, sem PII, e não vaza ip_hmac, user_agent, nome, WhatsApp nem origem", async () => {
    const nome = "Zz Auditoria Secreta";
    const [l] = await db
      .insert(lead)
      .values({ nome, whatsapp: "67999990077", cidadeUf: "Campo Grande/MS", negocio: `${PRE}Pet`, tempoFuncionamento: "1", pessoas: "1", maiorDesafio: "x", jaFezMentoria: false, mensagem: "texto livre sigiloso", origem: `${PRE}${randomUUID()}` })
      .returning({ id: lead.id });
    ids.push(l.id);
    await db.insert(consentEvents).values({ leadId: l.id, textoVersao: "0.2", textoHash: "hash-zz", origem: `${PRE}url-origem`, ipHmac: "IPHMAC-ZZ", userAgent: "UA-ZZ-AGENT" });
    await db.insert(auditLog).values({ acao: "=cmd|' /C calc'!A0", leadId: l.id }); // ação maliciosa hipotética

    const antesAdmin = (await db.select().from(adminEvents)).filter((e) => e.acao === "export_auditoria").length;
    const antesAudit = (await db.select().from(auditLog)).filter((e) => e.acao === "export_auditoria").length;
    const csv = await gerarCsvAuditoria();

    // o export se registrou (admin_events + audit_log com lead_id nulo) e aparece no próprio arquivo
    const depoisAdmin = await db.select().from(adminEvents);
    const depoisAudit = await db.select().from(auditLog);
    expect(depoisAdmin.filter((e) => e.acao === "export_auditoria")).toHaveLength(antesAdmin + 1);
    const novosAudit = depoisAudit.filter((e) => e.acao === "export_auditoria");
    expect(novosAudit).toHaveLength(antesAudit + 1);
    expect(novosAudit.every((e) => e.leadId === null)).toBe(true);
    expect(csv).toContain("admin_events");
    expect(csv).toContain("export_auditoria");

    // colunas e ausência de PII
    expect(csv.replace(/^﻿/, "").split("\r\n")[0]).toBe(CABECALHO_AUDITORIA.join(","));
    for (const proibido of ["IPHMAC-ZZ", "UA-ZZ-AGENT", nome, "67999990077", "texto livre sigiloso", "url-origem", "ip_hmac", "user_agent"]) {
      expect(csv).not.toContain(proibido);
    }
    // consentimento presente (prova) e fórmula neutralizada
    expect(csv).toContain("consent_events");
    expect(csv).toContain("hash-zz");
    expect(csv).toContain("'=cmd");
    expect(csv).not.toMatch(/(^|,)=cmd/m);
  });
});
