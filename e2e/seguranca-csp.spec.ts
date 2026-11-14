import { expect, test } from "@playwright/test";

// CSP está em Report-Only: o navegador só emite `securitypolicyviolation`. Aqui medimos que não há violação nas páginas.
const ROTAS = ["/", "/admin/login", "/politica-de-privacidade", "/termos-de-uso"];

test("CSP Report-Only presente com as diretivas de bloqueio", async ({ request }) => {
  const csp = (await request.get("/admin/login")).headers()["content-security-policy-report-only"] ?? "";
  for (const d of ["frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'"]) expect(csp).toContain(d);
});

for (const rota of ROTAS) {
  test(`sem violações de CSP em ${rota}`, async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __v: string[] }).__v = [];
      document.addEventListener("securitypolicyviolation", (e) =>
        (window as unknown as { __v: string[] }).__v.push(`${e.violatedDirective} ${e.blockedURI}`),
      );
    });
    await page.goto(rota);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => (window as unknown as { __v: string[] }).__v)).toEqual([]);
  });
}
