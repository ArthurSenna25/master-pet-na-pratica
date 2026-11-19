import { expect, test } from "@playwright/test";

// Rede de segurança do pin: se, com o pin ligado, o conteúdo NÃO couber na altura disponível, Dia e Trilha caem para cards em vez de cortar.
// Simulado inflando o texto antes da hidratação (viewport padrão 1280x720 = pin).
test("pin que não cabe cai para cards (Dia e Trilha), sem corte e sem overflow", async ({ page }) => {
  // acrescenta a regra às folhas de estilo (injetar <style> via script seria apagado pela hidratação do React)
  await page.route("**/*.css", async (route) => {
    const r = await route.fetch();
    await route.fulfill({ response: r, body: (await r.text()) + " .nm-diag__q p, .nm-out__d, .nm-pick, .nm-st p, .nm-st h3, .nm-beat p { font-size: 64px !important; line-height: 1.3 !important; min-height: 120px !important; }" });
  });
  await page.goto("/mentoria");
  await page.waitForTimeout(2500); // hidratou e as cenas rodaram
  await expect(page.locator(".nm-dia.is-pinned")).toHaveCount(0);
  await expect(page.locator(".nm-trilha.is-pinned")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  // versão em cards: o Diagnóstico e as 6 estações estão inteiros no fluxo
  const dia = await page.evaluate(() => { const d = document.querySelector(".nm-diag")!; const r = d.getBoundingClientRect(); return { op: +getComputedStyle(d).opacity, w: r.width, h: r.height }; });
  expect(dia.op).toBe(1);
  expect(dia.h).toBeGreaterThan(200);
  await expect(page.locator(".nm-st")).toHaveCount(6);
});

test("controle: sem inflar o texto, o pin liga (a rede de segurança não derruba o caso normal)", async ({ page }) => {
  await page.goto("/mentoria");
  await expect(page.locator(".nm-dia.is-pinned")).toHaveCount(1);
  await expect(page.locator(".nm-trilha.is-pinned")).toHaveCount(1);
});
