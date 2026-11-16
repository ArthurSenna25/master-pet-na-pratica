// GUARDA DE CI (F10 c3): as folhas de estilo carregadas por rota não podem conter seletores de outro escopo (lp-/mp-/lg- = landing e legal,
// nm- = mentoria, ad = painel) nem tokens da marca na mentoria. Rode depois de `npm run build`.
import { expect, test, type Page } from "@playwright/test";

type Escopo = "lp" | "nm" | "ad";
const PREFIXOS: Record<Escopo, RegExp> = {
  lp: /\.(?:lp|mp|lg)-[\w-]/,
  nm: /\.nm(?:-[\w-]+)?(?![\w-])/,
  ad: /\.ad(?:-[\w-]+)?(?![\w-])/,
};

async function seletores(page: Page): Promise<{ regras: string[]; css: string }> {
  return page.evaluate(() => {
    const regras: string[] = [];
    let css = "";
    const visita = (rs: CSSRuleList) => {
      for (const r of Array.from(rs)) {
        if ("selectorText" in r) { regras.push((r as CSSStyleRule).selectorText); css += r.cssText + "\n"; }
        else if ("cssRules" in r) visita((r as CSSGroupingRule).cssRules);
      }
    };
    for (const s of Array.from(document.styleSheets)) { try { visita(s.cssRules); } catch { /* folha de outra origem */ } }
    return { regras, css };
  });
}

const ROTAS: { url: string; proprio: Escopo; proibidos: Escopo[] }[] = [
  { url: "/", proprio: "lp", proibidos: ["nm", "ad"] },
  { url: "/politica-de-privacidade", proprio: "lp", proibidos: ["nm", "ad"] },
  { url: "/termos-de-uso", proprio: "lp", proibidos: ["nm", "ad"] },
  { url: "/mentoria", proprio: "nm", proibidos: ["lp", "ad"] },
  { url: "/admin/login", proprio: "ad", proibidos: ["lp", "nm"] },
];

for (const r of ROTAS) {
  test(`folhas de estilo de ${r.url}: só o escopo "${r.proprio}"`, async ({ page }) => {
    await page.goto(r.url);
    const { regras, css } = await seletores(page);
    expect(regras.length, "a página carregou alguma folha").toBeGreaterThan(0);
    expect(regras.some((s) => PREFIXOS[r.proprio].test(s)), `guarda não-vazia: há seletor ${r.proprio}`).toBe(true);
    for (const p of r.proibidos) expect(regras.filter((s) => PREFIXOS[p].test(s)).slice(0, 5), `seletores ${p} em ${r.url}`).toEqual([]);
    if (r.url === "/mentoria") expect(css, "tokens da marca presencial não entram na mentoria").not.toMatch(/--mp-|--font-display|--font-body/);
  });
}
