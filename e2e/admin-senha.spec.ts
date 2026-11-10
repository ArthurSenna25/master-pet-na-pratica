import { randomBytes } from "node:crypto";
import { count, eq } from "drizzle-orm";
import { expect, test, type Page } from "@playwright/test";
import { auth } from "../app/_lib/auth";
import { getDb } from "../app/_lib/db";
import { account, adminEvents, user } from "../app/_lib/db/schema";
import { entrar } from "./admin-helpers";

const SHOTS = process.env.SHOT_DIR ?? "test-results";

const ORIGINAL = process.env.ADMIN_PASSWORD ?? "";
const campo = (page: Page, nome: string) => page.locator(`input[name="${nome}"]`);

async function preencher(page: Page, atual: string, nova: string, confirmacao: string) {
  await page.goto("/admin/senha");
  await page.locator("form").evaluate((f) => ((f as HTMLFormElement).noValidate = true)); // prova a camada do servidor
  await campo(page, "atual").fill(atual);
  await campo(page, "nova").fill(nova);
  await campo(page, "confirmacao").fill(confirmacao);
  await page.getByRole("button", { name: "Salvar nova senha" }).click();
}

const eventos = async () => (await getDb().select({ n: count() }).from(adminEvents).where(eq(adminEvents.acao, "troca_senha")))[0].n;

/** Rede de segurança: grava o hash da senha original direto na conta, sem passar pela UI. */
async function restaurarSenhaOriginal() {
  const ctx = await auth.$context;
  const [u] = await getDb().select({ id: user.id }).from(user).where(eq(user.email, (process.env.ADMIN_EMAIL ?? "").toLowerCase()));
  if (u) await getDb().update(account).set({ password: await ctx.password.hash(ORIGINAL) }).where(eq(account.userId, u.id));
}

test.describe("alterar senha", () => {
  test("sem sessão: redireciona ao login", async ({ page }) => {
    await page.goto("/admin/senha");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("a página é noindex e os campos têm autocomplete certo", async ({ page }) => {
    await entrar(page);
    await page.goto("/admin/senha");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(campo(page, "atual")).toHaveAttribute("autocomplete", "current-password");
    await expect(campo(page, "nova")).toHaveAttribute("autocomplete", "new-password");
    await expect(campo(page, "confirmacao")).toHaveAttribute("autocomplete", "new-password");
  });

  test("link no menu do painel leva à página", async ({ page }) => {
    await entrar(page);
    await page.getByRole("link", { name: "Alterar senha" }).click();
    await expect(page).toHaveURL(/\/admin\/senha$/);
  });

  test("senha atual errada: mensagem genérica, sem evento", async ({ page }) => {
    await entrar(page);
    const antes = await eventos();
    await preencher(page, "senha-errada-xyz", "nova-senha-segura-1", "nova-senha-segura-1");
    await expect(page.getByRole("alert").filter({ hasText: "Senha atual incorreta." })).toBeVisible();
    expect(await eventos()).toBe(antes);
  });

  test("nova curta e confirmação diferente são recusadas", async ({ page }) => {
    await entrar(page);
    await preencher(page, ORIGINAL, "curta-123", "curta-123");
    await expect(page.getByRole("alert").filter({ hasText: "de 12 a 200" })).toBeVisible();
    await preencher(page, ORIGINAL, "nova-senha-segura-1", "nova-senha-segura-2");
    await expect(page.getByRole("alert").filter({ hasText: "confirmação não é igual" })).toBeVisible();
    await preencher(page, ORIGINAL, ORIGINAL, ORIGINAL);
    await expect(page.getByRole("alert").filter({ hasText: "diferente da atual" })).toBeVisible();
  });

  test("troca com sucesso, login com a nova funciona e a senha é restaurada", async ({ page }) => {
    const nova = `T-${randomBytes(9).toString("hex")}`;
    const antes = await eventos();
    try {
      await entrar(page);
      await preencher(page, ORIGINAL, nova, nova);
      await page.waitForURL("**/admin?ok=senha");
      await expect(page.getByRole("status").filter({ hasText: "Senha alterada" })).toBeVisible();
      expect(await eventos()).toBe(antes + 1);
      await expect(page.getByRole("heading", { name: "Painel" })).toBeVisible(); // a sessão atual seguiu válida

      await page.getByRole("button", { name: "Sair" }).click();
      await page.goto("/admin/login");
      await page.getByLabel("E-mail").fill(process.env.ADMIN_EMAIL ?? "");
      await page.getByLabel("Senha").fill(nova);
      await page.getByRole("button", { name: "Entrar" }).click();
      await page.waitForURL("**/admin");

      await preencher(page, nova, ORIGINAL, ORIGINAL); // volta pela própria tela
      await page.waitForURL("**/admin?ok=senha");
    } finally {
      await restaurarSenhaOriginal();
    }
  });
});

test("screenshots mobile e desktop de /admin/senha", async ({ page, browserName }) => {
  await entrar(page);
  for (const [nome, w, h] of [["mobile", 390, 844], ["desktop", 1440, 900]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/admin/senha");
    await expect(page.getByRole("heading", { name: "Alterar senha" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await page.screenshot({ path: `${SHOTS}/senha-${browserName}-${nome}.png` });
  }
});
