import { expect, test, type Browser } from "@playwright/test";
import { eq } from "drizzle-orm";
import { getDb } from "../app/_lib/db";
import { lead } from "../app/_lib/db/schema";
import { criarLeads, entrar, limparLeads } from "./admin-helpers";

const SHOTS = process.env.SHOT_DIR ?? "test-results";
const NOME = "Zz Modal Teste";
const idDe = async (nome: string) => (await getDb().select({ id: lead.id }).from(lead).where(eq(lead.nome, nome)))[0]?.id;
const existe = async (nome: string) => (await idDe(nome)) !== undefined;

// Um login só por arquivo (limite de 5/min): os testes reaproveitam a sessão.
const SESSAO = "test-results/.sessao-modal.json"; // dentro de test-results (ignorado pelo git)
test.beforeAll(async ({ browser }: { browser: Browser }) => {
  const ctx = await browser.newContext({ storageState: undefined });
  await entrar(await ctx.newPage());
  await ctx.storageState({ path: SESSAO });
  await ctx.close();
});
test.beforeEach(async () => {
  await limparLeads();
  await criarLeads([{ nome: NOME, whatsapp: "67999990031" }, { nome: "Zz Outro Teste", whatsapp: "67999990032" }, { nome: "Zz Apaga Modal", whatsapp: "67999990033" }]);
});
test.afterEach(async () => { await limparLeads(); });
test.use({ storageState: SESSAO });

const abrir = async (page: import("@playwright/test").Page, url = "/admin?q=zz-teste&ordem=asc") => {
  await page.goto(url);
  const link = page.getByRole("link", { name: `Ver lead ${NOME}` });
  await link.focus();
  await link.press("Enter");
  const dialog = page.getByRole("dialog", { name: NOME });
  await expect(dialog).toBeVisible();
  return { link, dialog };
};

test("abre em modal; Esc, Fechar e clique fora fecham; foco volta ao item; filtros preservados", async ({ page, browserName }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const { link, dialog } = await abrir(page);
  await expect(page).toHaveURL(/\/admin\/lead\/[0-9a-f-]{36}$/);
  await expect(dialog).toHaveAttribute("aria-labelledby", "lead-titulo");
  await page.screenshot({ path: `${SHOTS}/modal-desktop.png`, mask: [page.locator("[data-admin-email]")] });

  // foco preso: Tab várias vezes nunca sai do dialog (Safari não passa o Tab por links; lá vale só o dialog inerte nativo)
  for (let i = 0; i < (browserName === "webkit" ? 0 : 12); i++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(/\/admin\?q=zz-teste&ordem=asc$/);
  await expect(link).toBeFocused();

  await link.press("Enter");
  await page.getByRole("button", { name: "Fechar" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(link).toBeFocused();

  await link.press("Enter");
  await expect(dialog).toBeVisible();
  await page.mouse.click(5, 5); // backdrop
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(/\/admin\?q=zz-teste&ordem=asc$/);
});

test("URL direta mostra a página (sem dialog) e no celular o modal ocupa a tela", async ({ page }) => {
  const id = (await idDe(NOME))!;
  await page.goto(`/admin/lead/${id}`);
  await expect(page.getByRole("heading", { level: 1, name: NOME })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  const { dialog } = await abrir(page);
  const box = (await dialog.boundingBox())!;
  expect([Math.round(box.x), Math.round(box.width), Math.round(box.height)]).toEqual([0, 390, 844]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.screenshot({ path: `${SHOTS}/modal-mobile.png`, mask: [page.locator("[data-admin-email]")] });
});

// Teste do redirect das actions na rota interceptada (decisão do plano): registra qual comportamento vale.
test("actions dentro do modal: salvar, anonimizar e excluir em 2 passos", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const { dialog } = await abrir(page);

  await dialog.getByLabel("Status").selectOption("em_contato");
  await dialog.getByRole("button", { name: "Salvar" }).click();
  await expect(page).toHaveURL(/ok=salvo/);
  await expect(dialog).toBeVisible(); // continua modal após o redirect da action
  await expect(dialog.getByRole("status")).toHaveText("Alterações salvas.");

  await dialog.getByRole("link", { name: "Anonimizar…" }).click();
  await expect(dialog.getByRole("alertdialog", { name: "Anonimizar este lead?" })).toBeVisible();
  expect(await existe(NOME)).toBe(true); // 1º passo não altera
  await dialog.getByRole("button", { name: "Sim, anonimizar" }).click();
  await expect(page.getByRole("dialog", { name: "Lead anonimizado" })).toBeVisible();
  expect(await existe(NOME)).toBe(false);

  // fechar volta à lista com os filtros (history não foi empilhado pelas etapas)
  await page.getByRole("button", { name: "Fechar" }).click();
  await expect(page).toHaveURL(/\/admin\?q=zz-teste&ordem=asc$/);

  await page.getByRole("link", { name: "Ver lead Zz Apaga Modal" }).click();
  const d2 = page.getByRole("dialog", { name: "Zz Apaga Modal" });
  await expect(d2).toBeVisible();
  await d2.getByRole("link", { name: "Excluir…" }).click();
  await expect(d2.getByRole("alertdialog", { name: "Excluir este lead?" })).toBeVisible();
  expect(await existe("Zz Apaga Modal")).toBe(true);
  await d2.getByRole("button", { name: "Sim, excluir" }).click();
  await expect(page).toHaveURL(/\/admin\?ok=excluido/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await existe("Zz Apaga Modal")).toBe(false);
});
