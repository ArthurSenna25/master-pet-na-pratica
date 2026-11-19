// Capturas dos estados do formulário da mentoria (passo 1, erro, passo 2, erro, confirmação). Só roda com SHOT_DIR. Grava um lead de teste (apagado).
import { neon } from "@neondatabase/serverless";
import { test as base, type Page } from "@playwright/test";
import { ipHmac } from "../app/_lib/seguranca";

const DIR = process.env.SHOT_DIR;
const sql = neon(process.env.DATABASE_URL ?? "");
const IP = "203.0.113.77";
const test = base.extend({
  context: async ({ context }, entregar) => {
    await context.setExtraHTTPHeaders({ "x-forwarded-for": IP });
    await entregar(context);
  },
});
test.skip(!DIR, "defina SHOT_DIR");
test.afterEach(async () => {
  await sql`delete from lead where negocio like 'zz-teste-shot%'`;
  await sql`delete from rate_limit where ip_hmac = ${ipHmac(IP)}`;
});

const foto = async (page: Page, nome: string, w: number, browserName: string) => {
  await page.waitForTimeout(400);
  await page.locator("#nm-form").screenshot({ path: `${DIR}/${browserName}-form-${nome}-${w}.png` });
};

for (const w of [390, 1440]) {
  test(`estados do formulário ${w}`, async ({ page, browserName }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/mentoria");
    await page.locator("#nm-form").scrollIntoViewIfNeeded();
    await foto(page, "1-passo1", w, browserName);
    await page.getByRole("button", { name: "Continuar" }).click();
    await foto(page, "2-passo1-erro", w, browserName);
    await page.getByLabel("Nome", { exact: true }).fill("Maria Silva");
    await page.getByLabel("WhatsApp", { exact: true }).fill("14999990000");
    await page.getByRole("button", { name: "Continuar" }).click();
    await foto(page, "3-passo2", w, browserName);
    await page.locator("button[type=submit]").click();
    await foto(page, "4-passo2-erros", w, browserName);
    await page.getByLabel("Cidade/UF").fill("Lins/SP");
    await page.getByLabel("Nome do negócio").fill("zz-teste-shot");
    await page.getByLabel("1 a 3 anos").check();
    await page.getByLabel("2 a 3", { exact: true }).check();
    await page.getByLabel("Equipe", { exact: true }).check();
    await page.getByLabel(/Concordo em receber/).check();
    await foto(page, "5-passo2-preenchido", w, browserName);
    await page.locator("button[type=submit]").click();
    await page.getByRole("heading", { name: "Pronto, você está na lista!" }).waitFor();
    await foto(page, "6-confirmacao", w, browserName);
  });
}
