import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { eq } from "drizzle-orm";
import { anonimizarLead } from "../app/_lib/anonimizar";
import { getDb } from "../app/_lib/db";
import { auditLog, lead } from "../app/_lib/db/schema";
import { abrirExportar, criarLeads, entrar, limparLeads, semOverflowHorizontal } from "./admin-helpers";

test("sem sessão: leads.csv responde 401 (sem redirect)", async ({ request }) => {
  const r = await request.get("/admin/leads.csv", { maxRedirects: 0 });
  expect(r.status()).toBe(401);
});

test.describe("com sessão: CSV de leads e botão WhatsApp", () => {
  const ids: string[] = [];
  test.beforeEach(async () => {
    await limparLeads();
    await criarLeads([
      { nome: "Zz Wa Ativo", whatsapp: "67999990041" },
      { nome: "Zz Wa Anonimo", whatsapp: "67999990042" },
    ]);
    const db = getDb();
    const [a] = await db.select({ id: lead.id }).from(lead).where(eq(lead.nome, "Zz Wa Anonimo"));
    ids.push(a.id);
    await anonimizarLead(a.id);
  });
  test.afterEach(async () => {
    for (const id of ids.splice(0)) await getDb().delete(auditLog).where(eq(auditLog.leadId, id));
    await limparLeads();
  });

  test("lista e detalhe têm WhatsApp (só do lead ativo); CSV baixa com aviso, sem PII de consentimento", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await entrar(page);

    // aviso + link comum (sem prefetch), dentro do menu Exportar
    await abrirExportar(page);
    await expect(page.getByText("contém dados pessoais; guarde o arquivo com cuidado")).toBeVisible();
    const link = page.getByRole("link", { name: "Baixar leads (CSV)" });
    await expect(link).toHaveAttribute("href", "/admin/leads.csv");

    // WhatsApp na lista: 1 botão para o ativo, nenhum para o anonimizado
    await page.getByLabel(/Buscar/).fill("zz-teste-");
    await page.getByRole("button", { name: "Filtrar" }).click();
    const wa = page.getByRole("link", { name: "Chamar no WhatsApp" });
    await expect(wa).toHaveCount(1);
    const href = (await wa.getAttribute("href"))!;
    expect(href).toMatch(/^https:\/\/wa\.me\/5567999990041\?text=/);
    expect(decodeURIComponent(href)).not.toContain("Zz Wa"); // texto neutro: sem nome
    expect(await wa.boundingBox().then((b) => b!.height)).toBeGreaterThanOrEqual(44);
    expect(await semOverflowHorizontal(page)).toBe(true);

    // WhatsApp no detalhe: ativo tem; anonimizado não
    const db = getDb();
    const [ativo] = await db.select({ id: lead.id }).from(lead).where(eq(lead.nome, "Zz Wa Ativo"));
    await page.goto(`/admin/lead/${ativo.id}`);
    await expect(page.getByRole("link", { name: "Chamar no WhatsApp" })).toHaveAttribute("href", /wa\.me\/5567999990041/);
    await page.goto(`/admin/lead/${ids[0]}`);
    await expect(page.getByRole("heading", { name: "Lead anonimizado" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Chamar no WhatsApp" })).toHaveCount(0);

    // download do CSV
    await page.goto("/admin");
    await abrirExportar(page);
    const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Baixar leads (CSV)" }).click()]);
    expect(dl.suggestedFilename()).toMatch(/^leads-\d{4}-\d{2}-\d{2}\.csv$/);
    const csv = await readFile((await dl.path())!, "utf8");
    expect(csv.replace(/^﻿/, "").split("\r\n")[0]).toMatch(/^id,nome,whatsapp,/);
    expect(csv).toContain("Zz Wa Ativo");
    expect(csv).not.toContain("Zz Wa Anonimo");
    expect(csv).not.toMatch(/ip_hmac|user_agent|texto_hash/i);
  });
});
