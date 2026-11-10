import { expect, test } from "@playwright/test";

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
    await page.getByLabel("Senha").fill("qualquer-senha-1");
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
      await page.getByLabel("Senha").fill(senha);
      await page.getByRole("button", { name: "Entrar" }).click();
      const alerta = page.locator("form").getByRole("alert");
      await expect(alerta).toBeVisible();
      mensagens.push((await alerta.textContent()) ?? "");
      await page.reload();
      await page.locator("form").evaluate((f) => ((f as HTMLFormElement).noValidate = true));
    }
    expect(mensagens).toEqual([ERRO, ERRO, ERRO]);
  });
});
