import { expect, test } from "@playwright/test";
import { eq } from "drizzle-orm";
import { getDb } from "../app/_lib/db";
import { lead } from "../app/_lib/db/schema";
import { criarLeads, entrar, limparLeads, semOverflowHorizontal } from "./admin-helpers";

const SHOTS = process.env.SHOT_DIR ?? "test-results";
const idDe = async (nome: string) => (await getDb().select({ id: lead.id }).from(lead).where(eq(lead.nome, nome)))[0]?.id;

test.describe("painel: status, observação, anonimizar, excluir", () => {
  test.beforeEach(async () => {
    await limparLeads();
    await criarLeads([
      { nome: "Zz Edita Teste", whatsapp: "67999990021" },
      { nome: "Zz Apaga Teste", whatsapp: "67999990022" },
    ]);
  });
  test.afterEach(async () => { await limparLeads(); });

  test("detalhe sem sessão redireciona ao login", async ({ page }) => {
    const id = await idDe("Zz Edita Teste");
    await page.goto(`/admin/lead/${id}?confirmar=excluir`);
    await expect(page).toHaveURL(/\/admin\/login/);
    expect(await idDe("Zz Edita Teste")).toBe(id);
  });

  test("status/observação, anonimizar em 2 passos e excluir sem JS", async ({ page, browser }, info) => {
    const idEdita = (await idDe("Zz Edita Teste"))!;
    const idApaga = (await idDe("Zz Apaga Teste"))!;
    await page.setViewportSize({ width: 390, height: 844 });
    await entrar(page);

    // status + observação
    await page.goto(`/admin/lead/${idEdita}`);
    expect(await semOverflowHorizontal(page)).toBe(true);
    await page.screenshot({ path: `${SHOTS}/detalhe-mobile-${info.project.name}.png`, fullPage: true });
    await page.getByLabel("Status").selectOption("em_contato");
    await page.getByLabel(/Observação/).fill("Ligar amanhã às 10h");
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByRole("status")).toHaveText("Alterações salvas.");
    await expect(page.getByLabel("Status")).toHaveValue("em_contato");
    await expect(page.getByLabel(/Observação/)).toHaveValue("Ligar amanhã às 10h");

    // anonimizar: 1º passo não altera; Cancelar volta; 2º passo confirma
    await page.getByRole("link", { name: "Anonimizar…" }).click();
    await expect(page.getByRole("alertdialog", { name: "Anonimizar este lead?" })).toBeVisible();
    expect(await semOverflowHorizontal(page)).toBe(true);
    await page.screenshot({ path: `${SHOTS}/confirma-mobile-${info.project.name}.png`, fullPage: true });
    expect((await getDb().select().from(lead).where(eq(lead.id, idEdita)))[0].nome).toBe("Zz Edita Teste");
    await page.getByRole("link", { name: "Cancelar" }).click();
    await expect(page.getByRole("heading", { name: "Zz Edita Teste" })).toBeVisible();
    await page.getByRole("link", { name: "Anonimizar…" }).click();
    await page.getByRole("button", { name: "Sim, anonimizar" }).click();
    await expect(page.getByRole("heading", { name: "Lead anonimizado" })).toBeVisible();
    await expect(page.getByText("Zz Edita Teste")).toHaveCount(0);
    const [anon] = await getDb().select().from(lead).where(eq(lead.id, idEdita));
    expect([anon.nome, anon.whatsapp, anon.observacao]).toEqual(["", "", null]);

    // excluir SEM JavaScript (cookie da sessão herdado): confirmação em 2 passos por GET + form
    const semJs = await browser.newContext({ storageState: await page.context().storageState(), javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const p2 = await semJs.newPage();
    await p2.goto(`/admin/lead/${idApaga}`);
    await p2.getByRole("link", { name: "Excluir…" }).click();
    await expect(p2.getByRole("alertdialog", { name: "Excluir este lead?" })).toBeVisible();
    await p2.getByRole("link", { name: "Cancelar" }).click();
    expect(await idDe("Zz Apaga Teste")).toBe(idApaga); // ainda existe
    await p2.getByRole("link", { name: "Excluir…" }).click();
    await p2.getByRole("button", { name: "Sim, excluir" }).click();
    await expect(p2).toHaveURL(/\/admin\?ok=excluido/);
    await expect(p2.getByText("Lead excluído.")).toBeVisible();
    expect(await idDe("Zz Apaga Teste")).toBeUndefined();
    await semJs.close();
  });
});
