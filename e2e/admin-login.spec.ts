import { expect, test } from "@playwright/test";
import { like } from "drizzle-orm";
import { getDb } from "../app/_lib/db";
import { rateLimit } from "../app/_lib/db/schema";

const ERRO = "E-mail ou senha incorretos.";

// Só a credencial errada chama o Better Auth (1 de 5 tentativas/min); os outros casos morrem no Zod do servidor.
test.describe("login em 3 camadas", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/login");
    // desliga a validação do navegador para provar a camada do servidor
    await page.locator("form").evaluate((f) => ((f as HTMLFormElement).noValidate = true));
  });

  test("navegador: e-mail inválido e senha vazia não enviam", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByLabel("E-mail")).toHaveAttribute("type", "email");
    await page.getByLabel("E-mail").fill("nao-e-email");
    await page.getByLabel("Senha", { exact: true }).fill("qualquer-senha-1");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.locator("form").getByRole("alert")).toHaveCount(0);
  });

  test("servidor: e-mail inválido, senha vazia e credencial errada dão a MESMA mensagem", async ({ page }) => {
    const mensagens: string[] = [];
    for (const [email, senha] of [
      ["nao-e-email", "qualquer-senha-1"],
      ["alguem@exemplo.com", ""],
      ["alguem-inexistente@exemplo.com", "senha-errada-123"],
    ]) {
      await page.getByLabel("E-mail").fill(email);
      await page.getByLabel("Senha", { exact: true }).fill(senha);
      await page.getByRole("button", { name: "Entrar" }).click();
      const alerta = page.locator("form").getByRole("alert");
      await expect(alerta).toBeVisible();
      mensagens.push((await alerta.textContent()) ?? "");
      await page.reload();
      await page.locator("form").evaluate((f) => ((f as HTMLFormElement).noValidate = true));
    }
    expect(mensagens).toEqual([ERRO, ERRO, ERRO]);
  });

  test("durante o envio: 'Entrando…' desabilitado; depois o erro aparece em alert e o botão volta", async ({ page }) => {
    await page.route("**/admin/login", async (r) => { if (r.request().method() === "POST") await new Promise((ok) => setTimeout(ok, 1000)); await r.continue(); });
    await page.getByLabel("E-mail").fill("alguem@exemplo.com");
    await page.getByLabel("Senha", { exact: true }).fill("");
    await page.getByRole("button", { name: "Entrar" }).click();
    const b = page.getByRole("button", { name: "Entrando…" });
    await expect(b).toBeVisible();
    await expect(b).toBeDisabled();
    await expect(page.locator("form").getByRole("alert")).toHaveText(ERRO);
    await expect(page.getByRole("button", { name: "Entrar", exact: true })).toBeEnabled();
  });

  test("layout: título Entrar no painel, alvos >= 44 px e sem overflow em 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: "Entrar no painel" })).toBeVisible();
    for (const el of [page.getByLabel("E-mail"), page.getByLabel("Senha", { exact: true }), page.getByRole("button", { name: "Entrar" })])
      expect((await el.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });

  test("aviso pós-troca de senha aparece em /admin/login?ok=senha (e só nele)", async ({ page }) => {
    await page.goto("/admin/login?ok=senha");
    await expect(page.getByRole("status").filter({ hasText: "Senha alterada. Entre com a nova senha." })).toBeVisible();
    await page.goto("/admin/login");
    await expect(page.getByRole("status")).toHaveCount(0);
  });

  test("limite próprio: a 6ª tentativa errada vira 'Muitas tentativas' e o contador é limpo no fim", async ({ page }) => {
    try {
      let ultima = "";
      for (let i = 0; i < 6; i++) {
        await page.getByLabel("E-mail").fill("alguem-inexistente@exemplo.com");
        await page.getByLabel("Senha", { exact: true }).fill("senha-errada-123");
        await page.getByRole("button", { name: "Entrar" }).click();
        await expect(page.locator("form").getByRole("alert")).toBeVisible();
        ultima = (await page.locator("form").getByRole("alert").textContent()) ?? "";
        await page.reload();
        await page.locator("form").evaluate((f) => ((f as HTMLFormElement).noValidate = true));
      }
      expect(ultima).toContain("Muitas tentativas");
    } finally {
      await getDb().delete(rateLimit).where(like(rateLimit.key, "app:login:%")); // a chave real depende do IP que o Next repassa
    }
  });
});
