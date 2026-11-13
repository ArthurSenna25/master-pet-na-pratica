// F5d: screenshots (login, senha, cabeçalho com menu aberto) e foco/contraste do <details> "Exportar".
import { expect, test, type Page } from "@playwright/test";
import { abrirExportar, entrar, semOverflowHorizontal } from "./admin-helpers";

const SHOTS = process.env.SHOT_DIR ?? "test-results";
const TELAS = [["mobile", 390, 844], ["desktop", 1440, 900]] as const;
const email = (p: Page) => p.locator("[data-admin-email]");

// luminância relativa WCAG a partir de "rgb(r, g, b)" / "color(srgb ...)"
const lum = (cor: string) => {
  const n = (cor.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
  const [r, g, b] = (cor.startsWith("color(") ? n.map((v) => v * 255) : n).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const razao = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

test("screenshots do login (vazio e com aviso pós-troca)", async ({ page, browserName }) => {
  for (const [nome, w, h] of TELAS) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/admin/login");
    expect(await semOverflowHorizontal(page)).toBe(true);
    await page.screenshot({ path: `${SHOTS}/login-${browserName}-${nome}.png` });
    await page.goto("/admin/login?ok=senha");
    await page.screenshot({ path: `${SHOTS}/login-aviso-${browserName}-${nome}.png` });
  }
});

test("cabeçalho: menu Exportar abre por teclado; foco e aviso legíveis; screenshots", async ({ page, browserName }) => {
  await entrar(page);
  for (const [nome, w, h] of TELAS) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/admin/leads");
    expect(await semOverflowHorizontal(page)).toBe(true);
    await page.locator("header").screenshot({ path: `${SHOTS}/cab-fechado-${browserName}-${nome}.png`, mask: [email(page)] });

    const resumo = page.locator("header details").filter({ visible: true }).locator("summary");
    await resumo.focus();
    const anelSummary = await page.evaluate(() => getComputedStyle(document.activeElement as HTMLElement).outlineColor);
    const fundoCab = await page.evaluate(() => getComputedStyle(document.querySelector("header") as HTMLElement).backgroundColor);
    expect(razao(anelSummary, fundoCab), "foco do summary").toBeGreaterThanOrEqual(3);

    await page.keyboard.press("Enter"); // abre por teclado
    await expect(page.locator("header details").filter({ visible: true })).toHaveAttribute("open", "");
    const item = page.getByRole("link", { name: "Baixar leads (CSV)" });
    if (browserName === "webkit") await item.focus(); // Safari não dá Tab em links (já anotado no PROGRESS)
    else await page.keyboard.press("Tab");
    await expect(item).toBeFocused();
    expect((await item.boundingBox())!.height).toBeGreaterThanOrEqual(44);

    const c = await page.evaluate(() => {
      const a = document.querySelector("header details a:focus-visible") as HTMLElement;
      const menu = a.parentElement as HTMLElement;
      const aviso = menu.querySelector(".ad-mw") as HTMLElement;
      return { anel: getComputedStyle(a).outlineColor, estilo: getComputedStyle(a).outlineStyle, menu: getComputedStyle(menu).backgroundColor, aviso: getComputedStyle(aviso).color, link: getComputedStyle(a).color };
    });
    expect(c.estilo).not.toBe("none");
    expect(razao(c.anel, c.menu), "anel de foco no menu").toBeGreaterThanOrEqual(3);
    expect(razao(c.aviso, c.menu), "aviso no menu").toBeGreaterThanOrEqual(4.5);
    expect(razao(c.link, c.menu), "link no menu").toBeGreaterThanOrEqual(4.5);
    await expect(page.getByText("contém dados pessoais; guarde o arquivo com cuidado").filter({ visible: true })).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/cab-aberto-${browserName}-${nome}.png`, mask: [email(page)], clip: { x: 0, y: 0, width: w, height: 420 } });
  }
});

test("fora do menu só 'Alterar senha' e 'Sair' aparecem; os 3 downloads são <a download>", async ({ page }) => {
  await entrar(page);
  await expect(page.getByRole("link", { name: "Baixar leads (CSV)" })).toBeHidden();
  await expect(page.getByRole("link", { name: "Alterar senha" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
  await abrirExportar(page);
  for (const n of ["Baixar leads (CSV)", "Baixar auditoria (CSV)", "Baixar documento LGPD"]) {
    const l = page.getByRole("link", { name: n });
    await expect(l).toBeVisible();
    await expect(l).toHaveAttribute("download", "");
  }
});

test("screenshots da troca de senha com erros por campo", async ({ page, browserName }) => {
  await entrar(page);
  for (const [nome, w, h] of TELAS) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/admin/senha");
    await page.locator("form").evaluate((f) => ((f as HTMLFormElement).noValidate = true));
    await page.locator('input[name="atual"]').fill("x");
    await page.locator('input[name="nova"]').fill("curta-123");
    await page.locator('input[name="confirmacao"]').fill("outra");
    await page.getByRole("button", { name: "Mostrar nova senha" }).click();
    await page.getByRole("button", { name: "Salvar nova senha" }).click();
    await expect(page.getByText("A confirmação não é igual")).toBeVisible();
    await expect(page.getByText("de 12 a 200")).toBeVisible();
    expect(await semOverflowHorizontal(page)).toBe(true);
    await page.screenshot({ path: `${SHOTS}/senha-erros-${browserName}-${nome}.png` });
  }
});
