import { expect, test } from "@playwright/test";
import { criarLeads, entrar, limparLeads } from "./admin-helpers";

test.describe("painel: Limpar filtros e chips", () => {
  test.beforeEach(async () => {
    await limparLeads();
    await criarLeads([
      { nome: "Zz Ana Teste", whatsapp: "67999990001" },
      { nome: "Zz Bia Teste", whatsapp: "67999990002", status: "convertido" },
    ]);
  });
  test.afterEach(async () => { await limparLeads(); });

  test("sem filtro não há Limpar nem chips; com filtro, chips saem um a um e Limpar zera", async ({ page }) => {
    await entrar(page);
    await page.goto("/admin");
    await expect(page.getByRole("link", { name: "Limpar filtros" })).toHaveCount(0);
    await expect(page.getByRole("list", { name: "Filtros ativos" })).toHaveCount(0);

    await page.goto("/admin?q=zz-teste&status=convertido&ordem=asc&pagina=1");
    const chips = page.getByRole("list", { name: "Filtros ativos" }).getByRole("link");
    await expect(chips).toHaveCount(3);
    await expect(page.getByRole("link", { name: "Limpar filtros" })).toBeVisible();
    for (const c of await chips.all()) expect((await c.boundingBox())!.height).toBeGreaterThanOrEqual(44);

    await page.getByRole("link", { name: "Remover filtro: Status: Convertido" }).click();
    await expect(page).toHaveURL(/\/admin\?q=zz-teste&ordem=asc$/);
    await page.getByRole("link", { name: "Remover filtro: Ordem: mais antigos" }).click();
    await expect(page).toHaveURL(/\/admin\?q=zz-teste$/);
    await page.getByRole("link", { name: "Limpar filtros" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("link", { name: "Limpar filtros" })).toHaveCount(0);
  });

  test("só ordem fora do padrão já conta como filtro e funciona sem JS", async ({ browser, page }) => {
    await entrar(page);
    const ctx = await browser.newContext({ javaScriptEnabled: false, storageState: await page.context().storageState() });
    const semJs = await ctx.newPage();
    await semJs.goto("http://localhost:3000/admin?ordem=asc");
    await expect(semJs.getByRole("link", { name: "Limpar filtros" })).toBeVisible();
    await semJs.getByRole("link", { name: "Remover filtro: Ordem: mais antigos" }).click();
    await expect(semJs).toHaveURL(/\/admin$/);
    await ctx.close();
  });

  test("estado vazio mantém a orientação", async ({ page }) => {
    await entrar(page);
    await page.goto("/admin?q=zz-teste-nao-existe");
    await expect(page.getByText("Nenhum lead para este filtro")).toBeVisible();
    await expect(page.getByRole("link", { name: "Limpar filtros" })).toHaveCount(1);
  });
});
