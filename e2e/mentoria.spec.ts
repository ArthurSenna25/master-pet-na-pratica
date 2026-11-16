// F10 c4: casca estática da campanha mentoria (/mentoria): carrega sem erro, sem overflow horizontal, com imagens, noindex e "Em breve" no formulário.
import { expect, test } from "@playwright/test";

for (const w of [390, 1440]) {
  test(`/mentoria a ${w}px: sem erro de console, sem overflow, imagens carregadas`, async ({ page, browserName }) => {
    const erros: string[] = [];
    page.on("console", (m) => m.type() === "error" && !/Content Security Policy/.test(m.text()) && erros.push(m.text()));
    page.on("pageerror", (e) => erros.push(String(e)));
    await page.setViewportSize({ width: w, height: 844 });
    await page.goto("/mentoria");
    await page.evaluate(() => document.fonts.ready);
    await page.locator("img").evaluateAll((imgs) => imgs.forEach((i) => ((i as HTMLImageElement).loading = "eager")));
    await page.waitForTimeout(800);
    expect(erros, browserName).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    const quebradas = await page.locator("img").evaluateAll((imgs) => imgs.filter((i) => !(i as HTMLImageElement).complete || (i as HTMLImageElement).naturalWidth === 0).map((i) => (i as HTMLImageElement).src));
    expect(quebradas).toEqual([]);
  });
}

test("/mentoria: noindex, h1 e formulário em 'Em breve' sem campos que gravem", async ({ page }) => {
  await page.goto("/mentoria");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  await expect(page.locator("h1")).toContainText("sem depender de você");
  const form = page.locator("#nm-form");
  await expect(form).toContainText("Em breve");
  await expect(form).toContainText("demonstração: use dados fictícios");
  expect(await page.locator("form, input, textarea").count()).toBe(0); // o formulário real vem no c5
  await expect(page.locator(".nm-seal--ex, .nm-seal").first()).toBeVisible(); // selos "exemplo"/"provisório" mantidos
});

test("faixa de depoimentos: tabindex só abaixo de 900 px e reage à mudança de largura", async ({ page }) => {
  const faixa = page.locator("ul.nm-dep__track");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/mentoria");
  await expect(faixa).not.toHaveAttribute("tabindex", /.*/);
  await page.setViewportSize({ width: 600, height: 900 });
  await expect(faixa).toHaveAttribute("tabindex", "0");
  await page.setViewportSize({ width: 1200, height: 900 });
  await expect(faixa).not.toHaveAttribute("tabindex", /.*/);
});

test("faixa de depoimentos a 390 px já nasce focável depois da hidratação; a 1440 não é tab stop", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/mentoria");
  await expect(page.locator("ul.nm-dep__track")).toHaveAttribute("tabindex", "0");
});

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("a trilha (6 estações) e a FAQ (6 respostas) ficam legíveis", async ({ page }) => {
    await page.goto("/mentoria");
    const estacoes = page.locator("li.nm-st");
    await expect(estacoes).toHaveCount(6);
    for (const titulo of ["Raio-X do negócio", "Gargalos", "Equipe", "Precificação", "Padrões", "Organização e métodos"]) {
      await expect(page.locator("li.nm-st").filter({ hasText: titulo }).first()).toBeVisible();
    }
    const respostas = page.locator(".nm-faq__a");
    await expect(respostas).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      const r = respostas.nth(i);
      await expect(r).toBeVisible();
      expect(((await r.innerText()) ?? "").trim().length).toBeGreaterThan(10);
    }
  });
});
