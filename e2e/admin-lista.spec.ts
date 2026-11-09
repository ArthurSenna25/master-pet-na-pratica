import { expect, test } from "@playwright/test";
import { criarLeads, entrar, limparLeads, semOverflowHorizontal } from "./admin-helpers";

const SHOTS = process.env.SHOT_DIR ?? "test-results";

test.describe("painel: lista, busca, filtro, resumo", () => {
  test.beforeEach(async () => {
    await limparLeads();
    await criarLeads([
      { nome: "Zz Ana Teste", whatsapp: "67999990001", negocio: "zz-teste-Pet 100%" },
      { nome: "Zz Bia Teste", whatsapp: "67999990002", negocio: "zz-teste-Pet 100x", status: "convertido" },
      { nome: "Zz Caio Teste", whatsapp: "67999990003", negocio: "zz-teste-Pet_Sub", status: "em_contato" },
    ]);
  });
  test.afterEach(async () => { await limparLeads(); });

  test("sem sessão redireciona ao login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  // Um login só (o limite de login é 5/min por desenho); troca de viewport dentro do teste.
  test("lista, busca literal e filtro (mobile 390 e desktop 1440)", async ({ page }, info) => {
    await entrar(page);
    for (const [nome, w, h] of [["mobile", 390, 844], ["desktop", 1440, 900]] as const) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/admin");
      await expect(page.getByRole("heading", { name: "Zz Ana Teste" })).toBeVisible();
      expect(await semOverflowHorizontal(page)).toBe(true);
      await page.screenshot({ path: `${SHOTS}/lista-${nome}-${info.project.name}.png`, fullPage: true });

      // % é literal: "100%" acha só o "Pet 100%".
      await page.getByLabel(/Buscar/).fill("zz-teste-Pet 100%");
      await page.getByRole("button", { name: "Filtrar" }).click();
      await expect(page.getByRole("heading", { name: "Zz Ana Teste" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Zz Bia Teste" })).toHaveCount(0);

      // telefone por dígitos
      await page.getByLabel(/Buscar/).fill("99990003");
      await page.getByRole("button", { name: "Filtrar" }).click();
      await expect(page.getByRole("heading", { name: "Zz Caio Teste" })).toBeVisible();

      // filtro por status + estado vazio
      await page.goto("/admin?status=convertido&q=zz-teste-Pet_Sub");
      await expect(page.getByText("Nenhum lead para este filtro")).toBeVisible();
      await page.screenshot({ path: `${SHOTS}/vazio-${nome}-${info.project.name}.png`, fullPage: true });

      // alvos de toque >= 44 px
      await page.goto("/admin");
      for (const alvo of [page.getByRole("button", { name: "Filtrar" }), page.getByRole("button", { name: "Sair" }), page.getByLabel(/Buscar/)]) {
        expect((await alvo.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});