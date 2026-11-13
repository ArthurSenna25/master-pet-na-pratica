// F8 c4: novo visual do lead (modal e página): vazamentos da landing, Salvando…, contador, WhatsApp formatado, anonimizado, barra de salvar no celular.
import { expect, test, type Browser, type Page } from "@playwright/test";
import { eq } from "drizzle-orm";
import { anonimizarLead } from "../app/_lib/anonimizar";
import { getDb } from "../app/_lib/db";
import { lead } from "../app/_lib/db/schema";
import { criarLeads, entrar, limparLeads, semOverflowHorizontal } from "./admin-helpers";

const NOME = "Zz Visual Lead";
const ANON = "Zz Visual Anon";
let idAnon = "";
const idDe = async (nome: string) => (await getDb().select({ id: lead.id }).from(lead).where(eq(lead.nome, nome)))[0]?.id as string;

// Um login só por arquivo (limite de 5/min): os testes reaproveitam a sessão.
const SESSAO = "test-results/.sessao-lead-ui.json";
test.beforeAll(async ({ browser }: { browser: Browser }) => {
  const ctx = await browser.newContext({ storageState: undefined });
  await entrar(await ctx.newPage());
  await ctx.storageState({ path: SESSAO });
  await ctx.close();
});
test.beforeEach(async () => {
  await limparLeads();
  await criarLeads([{ nome: NOME, whatsapp: "14999993211" }, { nome: ANON, whatsapp: "14999993212" }]);
  idAnon = await idDe(ANON); // guardado antes: depois de anonimizar o nome some
  await anonimizarLead(idAnon);
});
test.afterEach(async () => { await limparLeads(); });
test.use({ storageState: SESSAO });

const abrirModal = async (page: Page) => {
  await page.goto("/admin/leads?q=zz-teste&ordem=asc");
  await page.getByRole("link", { name: `Ver lead ${NOME}` }).click();
  const dialog = page.getByRole("dialog", { name: NOME });
  await expect(dialog).toBeVisible();
  return dialog;
};

test("sem vazamento da landing: página do lead, confirmação e modal (<dialog>)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const id = await idDe(NOME);
  await page.goto(`/admin/lead/${id}`);
  const pg = await page.evaluate(() => {
    const g = (s: string) => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e); return { m: c.marginTop, r: parseFloat(c.borderTopLeftRadius), pt: c.paddingTop, pb: c.paddingBottom }; };
    return { main: g("main.ad-main"), art: g("article.ad-dlg--page") };
  });
  expect(pg.main?.m).toBe("0px");
  expect(pg.art?.m).toBe("0px");
  expect(pg.art!.r).toBeLessThan(30);

  await page.goto(`/admin/lead/${id}?confirmar=excluir`); // <section> dentro de <main>: alvo da regra `main section:not(.lp-hero)` da landing
  const conf = await page.locator("main section.ad-conf").evaluate((e) => { const c = getComputedStyle(e); return { m: c.marginTop, r: parseFloat(c.borderTopLeftRadius), pt: c.paddingTop, pb: c.paddingBottom, fil: getComputedStyle(e, "::after").content }; });
  expect(conf.m).toBe("0px");
  expect(conf.r).toBeLessThan(30);
  expect(conf.pb).toBe(conf.pt);
  expect(conf.fil).toBe("none");

  const dialog = await abrirModal(page);
  const d = await dialog.evaluate((e) => { const c = getComputedStyle(e); const r = e.getBoundingClientRect(); return { b: c.borderTopWidth, p: c.paddingTop, m: c.marginTop, bg: c.backgroundColor, w: Math.round(r.width), h: Math.round(r.height) }; });
  expect(d).toEqual({ b: "0px", p: "0px", m: "0px", bg: "rgba(0, 0, 0, 0)", w: 1440, h: 900 }); // sem os estilos do UA para <dialog>
  expect(await dialog.locator(".ad-dlg").evaluate((e) => parseFloat(getComputedStyle(e).borderTopLeftRadius))).toBeLessThan(30);
});

test("WhatsApp formatado só na exibição; botão é o mesmo componente da lista; observação com contador", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const dialog = await abrirModal(page);
  await expect(dialog.getByText("(14) 99999-3211")).toBeVisible();
  await expect(dialog.getByText("14999993211")).toHaveCount(0);
  const wa = dialog.getByRole("link", { name: /^Chamar (.+ )?no WhatsApp$/ });
  await expect(wa).toHaveAttribute("href", /wa\.me\/5514999993211/); // o link continua só com dígitos
  const campo = dialog.getByLabel(/Observação/);
  await expect(dialog.getByText("0 / 2000")).toBeVisible();
  await campo.fill("Ligar às 10h");
  await expect(dialog.getByText("12 / 2000")).toBeVisible();
});

test("Salvar: 'Salvando…' durante o envio, depois confirmação visível com a hora", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const dialog = await abrirModal(page);
  await page.route("**/admin/lead/*", async (r) => { if (r.request().method() === "POST") await new Promise((ok) => setTimeout(ok, 1200)); await r.continue(); });
  await dialog.getByRole("radio", { name: "Convertido", exact: true }).check();
  await dialog.getByRole("button", { name: "Salvar" }).click();
  const b = dialog.getByRole("button", { name: "Salvando…" });
  await expect(b).toBeVisible();
  await expect(b).toBeDisabled(); // aria-disabled conta como desabilitado
  await expect(dialog.getByRole("status")).toHaveText("Alterações salvas.");
  await expect(dialog.getByText(/^às \d{2}:\d{2}$/)).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Salvar" })).toBeEnabled();
});

test("no celular o modal é tela cheia e o Salvar fica sempre à vista (barra fixa)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const dialog = await abrirModal(page);
  const salvar = dialog.getByRole("button", { name: "Salvar" });
  await expect(salvar).toBeInViewport({ ratio: 1 }); // sem rolar
  const antes = (await salvar.boundingBox())!;
  await dialog.locator(".ad-ov").evaluate((e) => e.scrollTo(0, 99999));
  await expect(salvar).toBeInViewport({ ratio: 1 }); // continua à vista depois de rolar até o fim (barra sticky)
  expect(antes.height).toBeGreaterThanOrEqual(44);
  expect(await semOverflowHorizontal(page)).toBe(true);
});

test("lead anonimizado: sem WhatsApp, sem edição e sem Anonimizar; Excluir segue disponível", async ({ page }) => {
  const id = idAnon;
  await page.goto(`/admin/lead/${id}`);
  await expect(page.getByRole("heading", { level: 1, name: "Lead anonimizado" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Chamar .*no WhatsApp/ })).toHaveCount(0);
  await expect(page.getByRole("radio")).toHaveCount(0);
  await expect(page.getByLabel(/Observação/)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Salvar" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Anonimizar…" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Excluir…" })).toBeVisible();
  await page.goto(`/admin/lead/${id}?confirmar=anonimizar`); // já anonimizado: o passo 2 de anonimizar não abre
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
});
