// Ferramenta de regressão visual (F10 c3): salva páginas-chave para comparar ANTES x DEPOIS de uma refatoração.
// Só roda com SHOT_DIR (ex.: SHOT_DIR=C:/tmp/antes npx playwright test visual-pares). Movimento reduzido: sem pins nem cenas, páginas estáveis.
// O e-mail do admin é coberto por máscara. Não afirma nada: quem compara é o script de pares.
import { expect, test } from "@playwright/test";
import { entrar } from "./admin-helpers";

const DIR = process.env.SHOT_DIR;
const TELAS = [
  { w: 390, h: 844 },
  { w: 1440, h: 900 },
];
const PAGINAS = [
  { nome: "home", url: "/", admin: false },
  { nome: "login", url: "/admin/login", admin: false },
  { nome: "admin", url: "/admin", admin: true },
  { nome: "politica", url: "/politica-de-privacidade", admin: false },
  { nome: "termos", url: "/termos-de-uso", admin: false },
  { nome: "mentoria", url: "/mentoria", admin: false },
] as const;

test.skip(!DIR, "defina SHOT_DIR");

for (const t of TELAS) {
  for (const p of PAGINAS) {
    test(`${p.nome} ${t.w}`, async ({ page, browserName }) => {
      await page.setViewportSize({ width: t.w, height: t.h });
      await page.emulateMedia({ reducedMotion: "reduce" });
      if (p.admin) await entrar(page);
      else await page.goto(p.url);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(600);
      await page.screenshot({
        path: `${DIR}/${browserName}-${p.nome}-${t.w}.png`,
        fullPage: true,
        mask: [page.locator("[data-admin-email]")],
      });
      expect(true).toBe(true);
    });
  }
}
