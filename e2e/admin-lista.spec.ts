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
    await page.goto("/admin/leads");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  // Um login só (o limite de login é 5/min por desenho); troca de viewport dentro do teste.
  test("lista, busca literal e filtro (mobile 390 e desktop 1440)", async ({ page }, info) => {
    await entrar(page);
    for (const [nome, w, h] of [["mobile", 390, 844], ["desktop", 1440, 900]] as const) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/admin/leads");
      await expect(page.getByRole("link", { name: "Ver lead Zz Ana Teste" })).toBeVisible();
      expect(await semOverflowHorizontal(page)).toBe(true);
      // Estrutura: tabela só >= 900 px, cartões abaixo; sempre 1 link por lead no que está visível.
      await expect(page.getByRole("table")).toHaveCount(w >= 900 ? 1 : 0);
      if (w >= 900) {
        await expect(page.getByRole("columnheader")).toHaveText(["Nome", "Negócio", "Cidade", "Status", "Recebido em", "Ações"]);
        await expect(page.getByRole("table", { name: "Leads recebidos" })).toBeVisible();
      }
      await expect(page.getByRole("link", { name: "Ver lead Zz Ana Teste" })).toHaveCount(1);
      // O e-mail do admin nunca vai para screenshot compartilhável.
      const email = page.locator("[data-admin-email]");
      await page.screenshot({ path: `${SHOTS}/lista-${nome}-${info.project.name}.png`, fullPage: true, mask: [email] });

      // % é literal: "100%" acha só o "Pet 100%".
      await page.getByLabel(/Buscar/).fill("zz-teste-Pet 100%");
      await page.getByRole("button", { name: "Filtrar" }).click();
      await expect(page.getByRole("link", { name: "Ver lead Zz Ana Teste" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Ver lead Zz Bia Teste" })).toHaveCount(0);

      // telefone por dígitos
      await page.getByLabel(/Buscar/).fill("99990003");
      await page.getByRole("button", { name: "Filtrar" }).click();
      await expect(page.getByRole("link", { name: "Ver lead Zz Caio Teste" })).toBeVisible();

      // filtro por status + estado vazio
      await page.goto("/admin/leads?status=convertido&q=zz-teste-Pet_Sub");
      await expect(page.getByText("Nenhum lead para este filtro")).toBeVisible();
      await page.screenshot({ path: `${SHOTS}/vazio-${nome}-${info.project.name}.png`, fullPage: true, mask: [page.locator("[data-admin-email]")] });

      // alvos de toque >= 44 px
      await page.goto("/admin/leads");
      for (const alvo of [page.getByRole("button", { name: "Filtrar" }), page.getByRole("button", { name: "Sair" }), page.getByLabel(/Buscar/)]) {
        expect((await alvo.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      }

      // Tabela: clicar na célula de data (longe do nome) abre o mesmo lead, pelo link único da linha.
      if (w >= 900) {
        // mouse.click = hit-test real; locator.click() recusa porque o ::after do link "intercepta" a célula (é o desenho).
        const cel = (await page.getByRole("row", { name: /Zz Ana Teste/ }).getByRole("cell").nth(4).boundingBox())!;
        await page.mouse.click(cel.x + cel.width / 2, cel.y + cel.height / 2);
        await expect(page).toHaveURL(/\/admin\/lead\/[0-9a-f-]{36}$/);
        await page.goto("/admin/leads");
      }
    }
  });
});