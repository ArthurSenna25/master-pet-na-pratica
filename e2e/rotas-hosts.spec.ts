// F10 c3: 404 por grupo de rota e reescrita por host (Host simulado), contra o build real. Rode depois de `npm run build`.
import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { entrar } from "./admin-helpers";

const MENTORIA = "mentoria-master-pet.vercel.app";
const get = (request: import("@playwright/test").APIRequestContext, path: string, host?: string) =>
  request.get(path, { headers: host ? { host } : {}, maxRedirects: 0 });

test.describe("host da campanha mentoria", () => {
  test("/ serve a mentoria (noindex, canonical no host da campanha) e /mentoria também", async ({ request }) => {
    for (const p of ["/", "/mentoria"]) {
      const r = await get(request, p, MENTORIA);
      expect(r.status(), p).toBe(200);
      const html = await r.text();
      expect(html).toContain("sem depender de você");
      expect(html).toContain("Em breve");
      expect(html).toMatch(/name="robots" content="noindex, nofollow"/);
      expect(html).toContain(`rel="canonical" href="https://${MENTORIA}/"`);
    }
  });

  test("/admin, /admin/login e /admin/qualquer-coisa são 404 e não mostram o painel", async ({ request }) => {
    for (const p of ["/admin", "/admin/login", "/admin/leads", "/admin/lead/x", "/admin/leads.csv", "/admin/xyz"]) {
      const r = await get(request, p, MENTORIA);
      expect(r.status(), p).toBe(404);
      const html = await r.text();
      expect(html, p).not.toContain("Entrar no painel");
      expect(html, p).not.toContain('id="ad"');
    }
  });

  test("política e termos continuam acessíveis (compartilhados)", async ({ request }) => {
    for (const p of ["/politica-de-privacidade", "/termos-de-uso"]) expect((await get(request, p, MENTORIA)).status(), p).toBe(200);
  });
});

test.describe("domínio principal e URL de preview NÃO são reescritos", () => {
  for (const host of [undefined, "master-pet-git-f10-x.vercel.app"]) {
    test(`host ${host ?? "padrão"}: / é a LP presencial, /admin/login é o painel`, async ({ request }) => {
      const home = await (await get(request, "/", host)).text();
      expect(home).toContain("lp-");
      expect(home).not.toContain("sem depender de você");
      const login = await get(request, "/admin/login", host);
      expect(login.status()).toBe(200);
      expect(await login.text()).toContain("Entrar no painel");
    });
  }
});

test.describe("404 por grupo de rota", () => {
  test("URL inexistente: 404 sem erro de servidor (presencial, legal, admin, mentoria)", async ({ request }) => {
    for (const [p, h] of [["/nao-existe", undefined], ["/politica-de-privacidade/x", undefined], ["/admin/nao-existe", undefined], ["/nao-existe", MENTORIA]] as const) {
      const r = await get(request, p, h);
      expect(r.status(), `${h ?? "principal"} ${p}`).toBe(404);
    }
  });

  test("notFound() do painel (lead inexistente): 404; com JS a página 404 do painel aparece; sem JS o HTML vem vazio (limite do Next, ver PROGRESS)", async ({ page, browser }) => {
    await entrar(page);
    const r = await page.goto(`/admin/lead/${randomUUID()}`);
    expect(r?.status()).toBe(404);
    await expect(page.locator("h1").first()).toHaveText("Página não encontrada");
    const ctx = await browser.newContext({ javaScriptEnabled: false, storageState: await page.context().storageState() });
    const semJs = await ctx.newPage();
    const r2 = await semJs.goto(`/admin/lead/${randomUUID()}`);
    expect(r2?.status()).toBe(404); // sem JS o corpo é o shell de erro do Next (vazio), mas o status é 404 e nada do painel vaza
    expect(await semJs.content()).not.toContain("Entrar no painel");
    await ctx.close();
  });
});
