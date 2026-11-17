import { expect, test } from "@playwright/test";

// A11y do Diagnóstico (só aparece às 18h no desktop com pin): conteúdo na árvore de acessibilidade desde o início e, se o foco entrar
// nele antes de a cena chegar lá, a página rola até o fim do percurso. Safari não dá Tab em links: lá o foco vem de focus().
test("Diagnóstico acessível desde o início e o foco leva a página até as 18h", async ({ page, browserName }) => {
  await page.goto("/mentoria");
  await expect(page.locator(".nm-dia.is-pinned")).toHaveCount(1); // hidratou; viewport padrão = pin
  await page.evaluate(() => scrollTo(0, 0));

  // no DOM e fora de visibility:hidden/display:none (leitor de tela e foco enxergam), mas ainda transparente
  const antes = await page.evaluate(() => { const d = document.querySelector(".nm-diag")!, c = getComputedStyle(d); return { vis: c.visibility, disp: c.display, op: +c.opacity, pe: c.pointerEvents }; });
  expect(antes).toMatchObject({ vis: "visible", disp: "grid", pe: "none" });
  expect(antes.op).toBeLessThan(0.05);
  await expect(page.getByRole("heading", { name: "Onde o seu dia trava?" })).toBeAttached();
  await expect(page.getByRole("link", { name: /O dia vira correria/ })).toBeAttached();

  const y0 = await page.evaluate(() => scrollY);
  const primeira = page.locator("a.nm-pick").first();
  if (browserName === "chromium") {
    // Tab real: percorre os focáveis até cair na 1ª opção do Diagnóstico
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press("Tab");
      if (await primeira.evaluate((e) => e === document.activeElement)) break;
    }
  } else {
    await primeira.focus();
  }
  await expect(primeira).toBeFocused();
  // a página rolou até o fim do percurso e o Diagnóstico ficou visível e clicável
  await expect.poll(() => page.evaluate(() => +getComputedStyle(document.querySelector(".nm-diag")!).opacity), { timeout: 10_000 }).toBeGreaterThan(0.95);
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(y0 + 300);
  await expect(page.locator(".nm-diag")).toBeVisible();
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.querySelector(".nm-diag")!).pointerEvents)).toBe("auto");
  await primeira.click();
  await expect(primeira).toHaveAttribute("aria-current", "true");
});

test.describe("reduced-motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("sem cena: Diagnóstico visível e focável sem rolagem forçada", async ({ page }) => {
    await page.goto("/mentoria");
    await page.waitForTimeout(800);
    expect(await page.locator(".nm-dia.is-pinned").count()).toBe(0);
    const y0 = await page.evaluate(() => scrollY);
    await page.locator("a.nm-pick").first().focus();
    await expect(page.locator("a.nm-pick").first()).toBeFocused();
    expect(await page.evaluate(() => +getComputedStyle(document.querySelector(".nm-diag")!).opacity)).toBe(1);
    expect(y0).toBe(0);
  });
});

// Leitor de tela simulado: a árvore de acessibilidade (ariaSnapshot) ignora visibility:hidden. Com o pin, as 4 dores e o título têm de estar nela
// em qualquer ponto do percurso (início, meio e fim = 18h), na ordem do DOM.
test("as dores do relógio ficam na árvore de acessibilidade durante todo o percurso do pin", async ({ page }) => {
  await page.goto("/mentoria");
  await expect(page.locator(".nm-dia.is-pinned")).toHaveCount(1);
  const dores = ["O dia começa na correria", "Cada um faz do seu jeito", "O preço vira palpite", "Tudo passa por você"];
  for (const f of [0, 0.5, 0.99]) {
    await page.evaluate((fr) => { const s = document.querySelector(".nm-dia") as HTMLElement; scrollTo(0, s.getBoundingClientRect().top + scrollY + (s.offsetHeight - innerHeight) * fr); }, f);
    await page.waitForTimeout(900);
    const arvore = await page.locator(".nm-dia").ariaSnapshot();
    let pos = -1;
    for (const d of dores) { const i = arvore.indexOf(d); expect(i, `"${d}" ausente da árvore de acessibilidade (percurso ${f})`).toBeGreaterThan(pos); pos = i; }
    expect(arvore, `título do Dia (percurso ${f})`).toContain("Das 8h às 18h");
  }
});
