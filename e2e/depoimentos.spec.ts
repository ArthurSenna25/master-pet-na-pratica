// Seção Depoimentos (F7): selo "exemplo" em tudo que é fictício, teclado da faixa no celular, nada oculto em reduced-motion.
import { expect, test } from "@playwright/test";

const SEC = "#depoimentos";

test("selo 'exemplo' no destaque, em todos os cartões e no placeholder de vídeo", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(SEC)).toHaveCount(1);
  await expect(page.locator(`${SEC} h2`)).toHaveCount(1);
  const cartoes = page.locator(`${SEC} .lp-tc__in`);
  expect(await cartoes.count()).toBeGreaterThan(0);
  // Falha se algum bloco ficar sem selo (os dados de demo têm isExample = true).
  for (const bloco of [page.locator(`${SEC} .lp-fe`), ...(await cartoes.all()), page.locator(`${SEC} .lp-vid`)]) {
    await expect(bloco.locator(".lp-prov", { hasText: /^exemplo/ })).toHaveCount(1);
  }
});

test.describe("celular 390x844", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("faixa: ul focável, ←/→ rolam um cartão, setas atualizam aria-disabled", async ({ page }) => {
    await page.goto("/");
    const trilho = page.locator(`${SEC} .lp-tcs__track`);
    const ant = page.getByRole("button", { name: "Depoimento anterior" });
    const prox = page.getByRole("button", { name: "Próximo depoimento" });
    await trilho.scrollIntoViewIfNeeded();
    await expect(trilho).toHaveAttribute("tabindex", "0");
    await expect(ant).toHaveAttribute("aria-disabled", "true");
    await trilho.focus();
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => trilho.evaluate((e) => e.scrollLeft)).toBeGreaterThan(100);
    await expect(ant).toHaveAttribute("aria-disabled", "false");
    await page.keyboard.press("ArrowLeft");
    await expect.poll(() => trilho.evaluate((e) => e.scrollLeft)).toBeLessThan(5);
    await expect(ant).toHaveAttribute("aria-disabled", "true");
    // Tab: da faixa para a seta anterior (aria-disabled não tira do foco) e depois para a próxima
    await page.keyboard.press("Tab");
    await expect(ant).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(prox).toBeFocused();
  });

  test("tabindex acompanha a largura (celular → desktop → celular)", async ({ page }) => {
    await page.goto("/");
    const trilho = page.locator(`${SEC} .lp-tcs__track`);
    await expect(trilho).toHaveAttribute("tabindex", "0");
    await page.setViewportSize({ width: 1100, height: 800 });
    await expect(trilho).not.toHaveAttribute("tabindex", /.*/);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(trilho).toHaveAttribute("tabindex", "0");
  });
});

test.describe("desktop 1440x800", () => {
  test.use({ viewport: { width: 1440, height: 800 } });

  test("o ul não é tab stop e as setas não aparecem", async ({ page }) => {
    await page.goto("/");
    const trilho = page.locator(`${SEC} .lp-tcs__track`);
    await expect(trilho).not.toHaveAttribute("tabindex", /.*/);
    await expect(page.getByRole("button", { name: "Próximo depoimento" })).toBeHidden();
    await trilho.evaluate((e) => (e as HTMLElement).focus());
    expect(await page.evaluate(() => document.activeElement?.matches(".lp-tcs__track"))).toBe(false);
  });
});

test.describe("reduced-motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("nada oculto, tudo legível", async ({ page }) => {
    await page.goto("/");
    await page.locator(SEC).scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const ocultos = await page.evaluate(() =>
      [...document.querySelectorAll("#depoimentos *")].filter((e) => !e.closest(".mp-fx") && getComputedStyle(e).opacity === "0").length,
    );
    expect(ocultos).toBe(0);
    await expect(page.locator(`${SEC} .lp-fe__q`)).toBeVisible();
    await expect(page.locator(`${SEC} .lp-tc`).first()).toBeVisible();
  });
});
