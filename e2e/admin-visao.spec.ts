import { expect, test } from "@playwright/test";
import { criarLeads, entrar, limparLeads, semOverflowHorizontal } from "./admin-helpers";

test.describe("Visão geral", () => {
  test.beforeEach(async () => { await limparLeads(); await criarLeads([
    { nome: "Ana Visao", whatsapp: "67999990001" },
    { nome: "Bia Visao", whatsapp: "67999990002" },
    { nome: "Cris Visao", whatsapp: "67999990003", status: "convertido" },
  ]); });
  test.afterEach(async () => { await limparLeads(); });

  for (const [nome, w, h] of [["390", 390, 844], ["1440", 1440, 900]] as const) {
    test(`com dados em ${nome}: cartões, gráfico acessível, funil, sem overflow, console limpo; "aguardando" bate com a lista`, async ({ page }) => {
      const erros: string[] = [];
      page.on("console", (m) => { if (m.type() === "error") erros.push(m.text()); });
      page.on("pageerror", (e) => erros.push(e.message));
      await page.setViewportSize({ width: w, height: h });
      await entrar(page);
      await expect(page.getByRole("heading", { name: "Visão geral" })).toBeVisible();
      await expect(page.getByText("Novos hoje")).toBeVisible();

      const grafico = page.getByRole("img", { name: /Leads por semana/ });
      await expect(grafico).toBeVisible();
      await expect(grafico).toHaveAccessibleDescription(/Total no período/);
      await page.getByText("Ver dados").click();
      await expect(page.getByRole("table", { name: "Leads por semana" }).getByRole("row")).toHaveCount(5);
      await expect(page.getByRole("region", { name: "Para chamar agora" })).toBeVisible();
      await expect(page.getByRole("region", { name: "Leads por status" }).getByRole("link")).toHaveCount(4);
      expect(await semOverflowHorizontal(page)).toBe(true);

      const card = page.getByRole("link", { name: /Aguardando contato/ });
      const n = Number((await card.locator(".ad-kpi__n").innerText()).trim());
      await card.click();
      await expect(page).toHaveURL(/\/admin\/leads\?status=novo&ordem=asc$/);
      await expect(page.getByRole("status").filter({ hasText: /leads? no filtro/ })).toHaveText(new RegExp(`^${n} leads? no filtro`));
      expect(erros).toEqual([]);
    });
  }
});
