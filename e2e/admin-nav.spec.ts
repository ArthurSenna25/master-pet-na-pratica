import { expect, test } from "@playwright/test";
import { entrar, semOverflowHorizontal } from "./admin-helpers";

test.describe("navegação do painel", () => {
  test("login cai na Visão geral; abas levam a Leads e voltam, com aria-current", async ({ page }) => {
    await entrar(page);
    await expect(page).toHaveURL(/\/admin$/);
    const nav = page.getByRole("navigation", { name: "Seções do painel" });
    await expect(nav.getByRole("link", { name: "Visão geral" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Leads" })).not.toHaveAttribute("aria-current", "page");
    await nav.getByRole("link", { name: "Leads" }).click();
    await expect(page).toHaveURL(/\/admin\/leads$/);
    await expect(nav.getByRole("link", { name: "Leads" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("search")).toBeVisible();
    await nav.getByRole("link", { name: "Visão geral" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    expect(await semOverflowHorizontal(page)).toBe(true);
  });

  test("aviso verde nos dois destinos: ?ok=senha na Visão geral e ?ok=excluido em Leads", async ({ page }) => {
    await entrar(page);
    await page.goto("/admin?ok=senha");
    await expect(page.getByRole("status").filter({ hasText: "Senha alterada" })).toBeVisible();
    await page.goto("/admin/leads?ok=excluido");
    await expect(page.getByRole("status").filter({ hasText: "Lead excluído" })).toBeVisible();
  });

  test("rotas sem sessão vão ao login", async ({ page }) => {
    for (const rota of ["/admin", "/admin/leads"]) {
      await page.goto(rota);
      await expect(page).toHaveURL(/\/admin\/login$/);
    }
  });
});
