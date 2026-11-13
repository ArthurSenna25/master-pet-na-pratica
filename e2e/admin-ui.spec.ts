// F8 c1: cabeçalho novo (menu por teclado, Esc devolve o foco), override do CSS da landing no admin e login sem overflow.
import { expect, test } from "@playwright/test";
import { abrirExportar, criarLeads, entrar, limparLeads, semOverflowHorizontal } from "./admin-helpers";

for (const [nome, w, h] of [["390", 390, 844], ["1440", 1440, 900]] as const) {
  test.describe(`cabeçalho ${nome}`, () => {
    test.use({ viewport: { width: w, height: h } });

    test("Esc fecha o menu e devolve o foco ao botão; clique fora também fecha", async ({ page }) => {
      await entrar(page);
      await page.goto("/admin/leads");
      const menu = page.locator("header details").filter({ visible: true });
      const resumo = menu.locator("summary");
      await resumo.focus();
      await page.keyboard.press("Enter");
      await expect(menu).toHaveAttribute("open", "");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Escape");
      await expect(menu).not.toHaveAttribute("open", "");
      await expect(resumo).toBeFocused();
      await abrirExportar(page);
      await expect(menu).toHaveAttribute("open", "");
      await page.mouse.click(5, h - 5);
      await expect(menu).not.toHaveAttribute("open", "");
    });

    test("alvos >= 44 px e sem overflow horizontal", async ({ page }) => {
      await entrar(page);
      await page.goto("/admin/leads");
      expect(await semOverflowHorizontal(page)).toBe(true);
      const alvos = page.locator("header").locator("a.ad-tab, a.ad-brand, summary, button").filter({ visible: true });
      for (const el of await alvos.all()) expect((await el.boundingBox())!.height, await el.innerText()).toBeGreaterThanOrEqual(44);
    });
  });
}

test("o CSS da landing não vaza para o admin: <section> do painel sem margem negativa nem raio de 48 px", async ({ page }) => {
  await entrar(page);
  await page.goto("/admin/senha");
  const s = await page.locator("main section.ad-card").evaluate((e) => {
    const c = getComputedStyle(e);
    return { margem: c.marginTop, raio: c.borderTopLeftRadius, filete: getComputedStyle(e, "::after").content, base: c.paddingBottom, topo: c.paddingTop };
  });
  expect(s.margem).toBe("0px");
  expect(parseFloat(s.raio)).toBeLessThan(30);
  expect(s.filete).toBe("none");
  expect(s.base).toBe(s.topo); // sem o vão de ~176 px de `main>section:not(:last-child)` da landing
  // na Visão geral os cartões <section> não são o último filho: lá valia `main>section:not(:last-child){padding-bottom:~176px}`
  await page.goto("/admin");
  const v = await page.locator("main section.ad-card").first().evaluate((e) => { const c = getComputedStyle(e); return { base: c.paddingBottom, topo: c.paddingTop }; });
  expect(v.base).toBe(v.topo);
});

test("login: tela com marca e formulário, sem overflow em 390", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin/login");
  expect(await semOverflowHorizontal(page)).toBe(true);
  await expect(page.getByRole("heading", { name: "Entrar no painel" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
});

// F8 c3: lista de leads — 3º vazamento da landing, WhatsApp acima do link esticado, 2º foco, alvos >= 44 px.

for (const [nome, w, h] of [["390", 390, 844], ["1440", 1440, 900]] as const) {
  test.describe(`lista de leads ${nome}`, () => {
    test.use({ viewport: { width: w, height: h } });
    test.beforeEach(async () => { await limparLeads(); await criarLeads([{ nome: "Zz Lista Um", whatsapp: "67999990071" }, { nome: "Zz Lista Dois", whatsapp: "67999990072", status: "convertido" }]); });
    test.afterEach(async () => { await limparLeads(); });

    test("sem vazamento da landing; WhatsApp acima do link esticado; WhatsApp é o 2º foco; alvos >= 44 px", async ({ page, browserName }) => {
      await entrar(page);
      await page.goto("/admin/leads?q=Zz%20Lista&status=novo");
      const est = await page.evaluate(() => {
        const g = (s: string) => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e); return { margem: c.marginTop, raio: parseFloat(c.borderTopLeftRadius), pos: c.position, disp: c.display }; };
        return { main: g("main.ad-main"), lista: g(".ad-list"), pills: g(".ad-pills"), act: g("td.ad-act") };
      });
      expect(est.main?.margem).toBe("0px");
      expect(est.lista?.raio).toBeLessThan(30);
      expect(est.pills?.margem).toBe("0px");
      if (w >= 900) expect(est.act?.disp).toBe("table-cell"); // a borda da linha cobre a coluna de ações

      const link = page.getByRole("link", { name: "Ver lead Zz Lista Um" });
      await expect(link).toHaveCount(1); // um único link por lead (o olho é aria-hidden e fora do Tab)
      const wa = page.getByRole("link", { name: "Chamar Zz Lista Um no WhatsApp" });
      const c = (await wa.boundingBox())!;
      // hit-test real: no centro do botão quem recebe o clique é o WhatsApp, não o link esticado da linha/cartão
      const alvo = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest("a")?.getAttribute("aria-label"), [c.x + c.width / 2, c.y + c.height / 2]);
      expect(alvo).toBe("Chamar Zz Lista Um no WhatsApp");
      if (browserName !== "webkit") { // Safari não dá Tab em links
        await link.focus();
        await page.keyboard.press("Tab");
        await expect(wa).toBeFocused();
      }
      for (const el of [wa, page.getByRole("link", { name: /^Remover filtro: Status/ }), page.getByRole("link", { name: "Limpar filtros" }), page.getByRole("link", { name: /^Novo/ })])
        expect((await el.boundingBox())!.height, await el.innerText()).toBeGreaterThanOrEqual(44);
      expect(await semOverflowHorizontal(page)).toBe(true);
    });
  });
}
