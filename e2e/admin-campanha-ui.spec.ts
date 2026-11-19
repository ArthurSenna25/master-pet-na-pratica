// F10 c7: seletor de campanha, selos (texto + ícone), filtro isolando lista e Visão geral, anonimizado mostra a campanha.
import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { getDb } from "../app/_lib/db";
import { lead } from "../app/_lib/db/schema";
import { entrar, limparLeads, PRE, semOverflowHorizontal } from "./admin-helpers";

const SHOTS = process.env.SHOT_DIR ?? "test-results";
const base = { whatsapp: "67999990000", cidadeUf: "Campo Grande/MS", tempoFuncionamento: "1 a 3 anos", pessoas: "2 a 3", maiorDesafio: "x" };
const novo = (nome: string, extra: Record<string, unknown> = {}) => ({ ...base, nome, negocio: `${PRE}Pet`, jaFezMentoria: false, origem: `${PRE}${randomUUID()}`, ...extra });

test.describe("campanha no painel", () => {
  test.beforeEach(async () => {
    await limparLeads();
    await getDb().insert(lead).values([
      novo("Ana Presencial"),
      novo("Bia Mentoria", { campanha: "mentoria", jaFezMentoria: null }),
      novo("", { campanha: "mentoria", jaFezMentoria: null, negocio: "", whatsapp: "", anonimizadoEm: new Date() }),
    ]);
  });
  test.afterEach(async () => { await limparLeads(); });

  for (const [nome, w, h] of [["390", 390, 844], ["1440", 1440, 900]] as const) {
    test(`leads em ${nome}: selos com texto, filtro isola, chip remove, anonimizado mantém campanha`, async ({ page, browserName }) => {
      await page.setViewportSize({ width: w, height: h });
      await entrar(page);
      await page.goto("/admin/leads?q=zz-teste-");
      const lista = page.locator(w >= 900 ? "table.ad-tbl" : "ul.ad-lc");
      await expect(lista.getByText("Mentoria", { exact: true })).toHaveCount(1); // o anonimizado não casa com a busca (negócio vazio)
      await expect(lista.getByText("Presencial", { exact: true })).toHaveCount(1);
      await page.screenshot({ path: `${SHOTS}/camp-leads-todas-${browserName}-${nome}.png`, mask: [page.locator("[data-admin-email]")] });

      await page.getByRole("navigation", { name: "Filtrar por campanha" }).getByRole("link", { name: "Mentoria" }).click();
      await expect(page).toHaveURL(/campanha=mentoria/);
      await page.goto("/admin/leads?campanha=mentoria"); // sem busca: o anonimizado aparece
      await expect(page.getByRole("link", { name: "Mentoria" }).first()).toHaveAttribute("aria-current", "true");
      await expect(page.getByText("Ana Presencial")).toHaveCount(0);
      await expect(lista.getByText("Presencial", { exact: true })).toHaveCount(0);
      await expect(lista.getByText("Bia Mentoria")).toBeVisible();
      await expect(lista.getByRole("link", { name: "Ver lead anonimizado" }).first()).toBeVisible();
      await expect(page.getByRole("list", { name: "Filtros ativos" })).toContainText("Campanha: Mentoria");
      expect(await semOverflowHorizontal(page)).toBe(true);
      await page.screenshot({ path: `${SHOTS}/camp-leads-mentoria-${browserName}-${nome}.png`, mask: [page.locator("[data-admin-email]")] });

      await page.getByRole("link", { name: "Remover filtro: Campanha: Mentoria" }).click();
      await expect(page).not.toHaveURL(/campanha=/);
    });

    test(`visão geral em ${nome}: seletor, contagem por campanha, filtro e valor inválido = todas`, async ({ page, browserName }) => {
      await page.setViewportSize({ width: w, height: h });
      await entrar(page);
      await expect(page.getByText(/Presencial: \d+/)).toBeVisible();
      await expect(page.getByText(/Mentoria: \d+/)).toBeVisible();
      await page.screenshot({ path: `${SHOTS}/camp-visao-todas-${browserName}-${nome}.png`, mask: [page.locator("[data-admin-email]")] });
      await page.getByRole("navigation", { name: "Filtrar por campanha" }).getByRole("link", { name: "Mentoria" }).click();
      await expect(page).toHaveURL(/\/admin\?campanha=mentoria/);
      await expect(page.getByText(/Presencial: \d+/)).toHaveCount(0);
      await expect(page.getByRole("region", { name: "Para chamar agora" }).getByText("Presencial", { exact: true })).toHaveCount(0);
      expect(await semOverflowHorizontal(page)).toBe(true);
      await page.screenshot({ path: `${SHOTS}/camp-visao-mentoria-${browserName}-${nome}.png`, mask: [page.locator("[data-admin-email]")] });
      await page.goto("/admin?campanha=zzz");
      await expect(page.getByRole("link", { name: "Todas" })).toHaveAttribute("aria-current", "true");
    });
  }

  test("sem JS o seletor funciona (links)", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/admin/login");
    await page.getByLabel("E-mail").fill(process.env.ADMIN_EMAIL ?? "");
    await page.getByLabel("Senha", { exact: true }).fill(process.env.ADMIN_PASSWORD ?? "");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("**/admin");
    await page.getByRole("navigation", { name: "Filtrar por campanha" }).getByRole("link", { name: "Presencial" }).click();
    await expect(page).toHaveURL(/campanha=presencial/);
    await ctx.close();
  });
});
