// Hash na URL com cenas pinadas: abrir /#conversar (ou /#acao) em aba nova e depois de F5 tem de cair no alvo, com o topo logo abaixo do header.
import { expect, test, type Page } from "@playwright/test";

/** Distância entre o topo do alvo e a base do header (0 = encostado, sem pin-spacer interferindo). */
const folga = (page: Page, alvo: string) =>
  page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const hdr = document.querySelector(".lp-header")?.getBoundingClientRect().height ?? 0;
    return el ? Math.round(el.getBoundingClientRect().top - hdr) : 9999;
  }, alvo);

async function esperarNoAlvo(page: Page, alvo: string) {
  // o salto assenta em até ~1 s depois do load (refresh das cenas + fontes)
  await expect.poll(() => folga(page, alvo), { timeout: 8000, intervals: [200] }).toBeLessThanOrEqual(2);
  await expect.poll(() => folga(page, alvo), { timeout: 3000 }).toBeGreaterThanOrEqual(-2);
}

// WebKit avisa que a CSP Report-Only não tem report-to (por desenho: só mede, ver SEGURANCA.md).
const RO = /report-only mode/;
function coletarErros(page: Page): string[] {
  const erros: string[] = [];
  page.on("pageerror", (e) => erros.push(String(e)));
  page.on("console", (m) => m.type() === "error" && !RO.test(m.text()) && erros.push(m.text()));
  return erros;
}

const VIEWPORTS = [
  { nome: "desktop 1440x800 (3 pins)", width: 1440, height: 800 },
  { nome: "mobile 390x844 (sem pin)", width: 390, height: 844 },
  { nome: "1366x657 (altura baixa, sem pin)", width: 1366, height: 657 },
];

for (const v of VIEWPORTS) {
  test.describe(v.nome, () => {
    test.use({ viewport: { width: v.width, height: v.height } });

    test("/#conversar: formulário visível com o topo abaixo do header; igual após F5", async ({ page }) => {
      const erros = coletarErros(page);
      await page.goto("/#conversar");
      await esperarNoAlvo(page, "#conversar");
      await expect(page.locator("#lp-form")).toBeInViewport();
      await expect(page.locator(".pin-spacer #conversar, .pin-spacer:has(#conversar)")).toHaveCount(0); // nenhum pin-spacer envolve o alvo
      await page.reload();
      await esperarNoAlvo(page, "#conversar");
      await expect(page.locator("#lp-form")).toBeInViewport();
      expect(erros).toEqual([]);
    });
  });
}

test.describe("reduced-motion", () => {
  test.use({ viewport: { width: 1440, height: 800 }, reducedMotion: "reduce" });
  test("/#conversar funciona sem cenas", async ({ page }) => {
    const erros = coletarErros(page);
    await page.goto("/#conversar");
    await esperarNoAlvo(page, "#conversar");
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
    expect(erros).toEqual([]);
  });
});

test.describe("pular direto para #acao (desktop com pin)", () => {
  test.use({ viewport: { width: 1440, height: 800 } });
  test("cai em Camila em ação, no tema 1, sem cena sobreposta", async ({ page }) => {
    const erros = coletarErros(page);
    await page.goto("/#acao");
    await expect.poll(() => folga(page, "#acao"), { timeout: 8000, intervals: [200] }).toBeLessThanOrEqual(2);
    await expect(page.locator("#acao")).toBeInViewport();
    const opacidades = await page.evaluate(() => [...document.querySelectorAll("#acao .lp-scene")].map((e) => Number(getComputedStyle(e).opacity)));
    expect(opacidades.length).toBeGreaterThan(1);
    expect(opacidades.filter((o) => o > 0.95)).toHaveLength(1); // exatamente uma cena visível
    expect(opacidades.filter((o) => o > 0.05 && o < 0.95)).toHaveLength(0); // nenhuma no meio da transição
    await page.reload();
    await expect.poll(() => folga(page, "#acao"), { timeout: 8000, intervals: [200] }).toBeLessThanOrEqual(2);
    expect(erros).toEqual([]);
  });
});
