import { randomUUID } from "node:crypto";
import { like } from "drizzle-orm";
import type { Page } from "@playwright/test";
import { getDb } from "../app/_lib/db";
import { lead } from "../app/_lib/db/schema";

export const PRE = "zz-teste-";

/** Credenciais vêm do .env.local (carregado pelo playwright.config); nunca impressas. */
export async function entrar(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("E-mail").fill(process.env.ADMIN_EMAIL ?? "");
  await page.getByLabel("Senha", { exact: true }).fill(process.env.ADMIN_PASSWORD ?? "");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/admin");
}

/** Os downloads ficam no <details> "Exportar" do cabeçalho; abre se ainda estiver fechado. */
export async function abrirExportar(page: Page) {
  const d = page.locator("header details").filter({ visible: true }); // ≥ 1000 px: "Exportar"; abaixo: "Menu"
  if ((await d.getAttribute("open")) === null) await d.locator("summary").click();
}

export async function criarLeads(
  itens: { nome: string; whatsapp: string; negocio?: string; status?: string }[],
): Promise<void> {
  await getDb().insert(lead).values(
    itens.map((i) => ({
      nome: i.nome,
      whatsapp: i.whatsapp,
      cidadeUf: "Campo Grande/MS",
      negocio: i.negocio ?? `${PRE}Pet Shop`,
      tempoFuncionamento: "1 a 3 anos",
      pessoas: "2 a 3",
      maiorDesafio: "x",
      jaFezMentoria: false,
      status: i.status ?? "novo",
      origem: `${PRE}${randomUUID()}`,
    })),
  );
}

/** Remove só o que os testes criaram (origem com prefixo); consent_events/audit seguem por cascade/independência. */
export async function limparLeads(): Promise<void> {
  await getDb().delete(lead).where(like(lead.origem, `${PRE}%`));
}

export const semOverflowHorizontal = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
