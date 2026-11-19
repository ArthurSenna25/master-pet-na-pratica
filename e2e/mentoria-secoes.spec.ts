// Capturas por seção da mentoria (F10): depoimentos, FAQ, formulário e rodapé. Só roda com SHOT_DIR. Imagens lazy são forçadas a carregar.
import { test } from "@playwright/test";

const DIR = process.env.SHOT_DIR;
test.skip(!DIR, "defina SHOT_DIR");

const SECOES = [
  { nome: "depoimentos", seletor: "#depoimentos" },
  { nome: "faq", seletor: "#faq" },
  { nome: "formulario", seletor: "#lista" },
  { nome: "rodape", seletor: "footer.nm-footer" },
];

for (const w of [390, 1440]) {
  for (const s of SECOES) {
    test(`${s.nome} ${w}`, async ({ page, browserName }) => {
      await page.setViewportSize({ width: w, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/mentoria");
      await page.locator("img").evaluateAll((imgs) => imgs.forEach((i) => ((i as HTMLImageElement).loading = "eager")));
      const alvo = page.locator(s.seletor);
      await alvo.scrollIntoViewIfNeeded();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(700);
      await alvo.screenshot({ path: `${DIR}/${browserName}-${s.nome}-${w}.png` });
    });
  }
}
