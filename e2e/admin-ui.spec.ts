// F8 c1: cabeçalho novo (menu por teclado, Esc devolve o foco), override do CSS da landing no admin e login sem overflow.
import { expect, test } from "@playwright/test";
import { abrirExportar, entrar, semOverflowHorizontal } from "./admin-helpers";

for (const [nome, w, h] of [["390", 390, 844], ["1440", 1440, 900]] as const) {
  test.describe(`cabeçalho ${nome}`, () => {
    test.use({ viewport: { width: w, height: h } });

    test("Esc fecha o menu e devolve o foco ao botão; clique fora também fecha", async ({ page }) => {
      await entrar(page);
      await page.goto("/admin/leads");
      const menu = page.locator("header details").filter({ visible: true });
      const resumo = menu.locator("summary");
      await resumo.focus();
      await page.keyboard.press("Enter");
      await expect(menu).toHaveAttribute("open", "");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Escape");
      await expect(menu).not.toHaveAttribute("open", "");
      await expect(resumo).toBeFocused();
      await abrirExportar(page);
      await expect(menu).toHaveAttribute("open", "");
      await page.mouse.click(5, h - 5);
      await expect(menu).not.toHaveAttribute("open", "");
    });

    test("alvos >= 44 px e sem overflow horizontal", async ({ page }) => {
      await entrar(page);
      await page.goto("/admin/leads");
      expect(await semOverflowHorizontal(page)).toBe(true);
      const alvos = page.locator("header").locator("a.ad-tab, a.ad-brand, summary, button").filter({ visible: true });
      for (const el of await alvos.all()) expect((await el.boundingBox())!.height, await el.innerText()).toBeGreaterThanOrEqual(44);
    });
  });
}

test("o CSS da landing não vaza para o admin: <section> do painel sem margem negativa nem raio de 48 px", async ({ page }) => {
  await entrar(page);
  await page.goto("/admin/senha");
  const s = await page.locator("main section.ad-card").evaluate((e) => {
    const c = getComputedStyle(e);
    return { margem: c.marginTop, raio: c.borderTopLeftRadius, filete: getComputedStyle(e, "::after").content };
  });
  expect(s.margem).toBe("0px");
  expect(parseFloat(s.raio)).toBeLessThan(30);
  expect(s.filete).toBe("none");
});

test("login: tela com marca e formulário, sem overflow em 390", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin/login");
  expect(await semOverflowHorizontal(page)).toBe(true);
  await expect(page.getByRole("heading", { name: "Entrar no painel" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
});
