// F10 c7: ponta a ponta. Formulário da mentoria (MENTORIA_FORM_ATIVO=1 no webServer :3000, só local/e2e) -> painel (selo, filtro) -> CSV -> exclusão pelo modal.
// Dados "zz-teste-"; limpeza por negócio ao fim. Leads reais não são tocados.
import { neon } from "@neondatabase/serverless";
import { expect, test as base } from "@playwright/test";
import { ipHmac } from "../app/_lib/seguranca";
import { entrar } from "./admin-helpers";

const PRE = "zz-teste-";
const sql = neon(process.env.DATABASE_URL ?? "");
const IPS = Array.from({ length: 254 }, (_, i) => `198.51.100.${i + 1}`);
const test = base.extend({
  context: async ({ context }, entregar) => {
    await context.setExtraHTTPHeaders({ "x-forwarded-for": IPS[Math.floor(Math.random() * 254)] });
    await entregar(context);
  },
});

async function limpar() {
  const ids = (await sql`select id from lead where negocio like ${PRE + "%"}`).map((r) => r.id as string);
  if (ids.length) {
    await sql`delete from audit_log where lead_id = any(${ids})`;
    await sql`delete from lead where id = any(${ids})`;
  }
  await sql`delete from rate_limit where ip_hmac = any(${IPS.map((ip) => ipHmac(ip))})`;
}
test.afterEach(limpar);
test.afterAll(limpar);

const sufixo = () => Array.from({ length: 8 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join("");
const existe = async (negocio: string) => (await sql`select 1 from lead where negocio = ${negocio}`).length === 1;

test("mentoria: formulário -> selo no painel -> filtro isola -> CSV com campanha -> exclusão pelo modal", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const negocio = `${PRE}${sufixo()}`;
  const nome = `${PRE}${sufixo()}`;

  // 1) formulário público da mentoria (dados de teste)
  await page.goto("/mentoria?origem=e2e-camp");
  await page.getByLabel("Nome", { exact: true }).fill(nome);
  await page.getByLabel("WhatsApp", { exact: true }).fill("14999990000");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Cidade/UF").fill("Lins/SP");
  await page.getByLabel("Nome do negócio").fill(negocio);
  await page.getByLabel("1 a 3 anos").check();
  await page.getByLabel("2 a 3", { exact: true }).check();
  await page.getByLabel("Equipe", { exact: true }).check();
  await page.getByLabel(/Concordo em receber/).check();
  await page.locator("button[type=submit]").click();
  await expect(page.getByRole("heading", { name: "Pronto, você está na lista!" })).toBeVisible();

  // 2) painel: selo Mentoria (texto), filtro isola
  await entrar(page);
  await page.goto(`/admin/leads?q=${negocio}`);
  const linha = page.locator("table.ad-tbl tbody tr").filter({ hasText: nome });
  await expect(linha).toHaveCount(1);
  await expect(linha.getByText("Mentoria", { exact: true })).toBeVisible();
  await page.goto(`/admin/leads?q=${negocio}&campanha=presencial`);
  await expect(page.getByText(nome)).toHaveCount(0);
  await page.goto(`/admin/leads?q=${negocio}&campanha=mentoria`);
  await expect(page.getByRole("link", { name: `Ver lead ${nome}` }).first()).toBeVisible();

  // 3) CSV: campanha=mentoria traz a linha com campanha e origem_campanha; presencial não traz
  const baixar = async (qs: string) => {
    const r = await page.request.get(`/admin/leads.csv${qs}`);
    expect(r.status()).toBe(200);
    return (await r.text()).replace(/^﻿/, "").split("\r\n");
  };
  const m = await baixar("?campanha=mentoria");
  const cab = m[0].split(",");
  const row = m.find((l) => l.includes(negocio))!.split(",");
  expect(row[cab.indexOf("campanha")]).toBe("mentoria");
  expect(row[cab.indexOf("origem_campanha")]).toBe("e2e-camp");
  expect(row[cab.indexOf("ja_fez_mentoria")]).toBe("nao_perguntado");
  expect((await baixar("?campanha=presencial")).some((l) => l.includes(negocio))).toBe(false);
  expect((await baixar("?campanha=zzz")).some((l) => l.includes(negocio))).toBe(true); // inválido = todas
  await page.goto("/admin/leads?campanha=mentoria");
  await expect(page.locator("header a[href='/admin/leads.csv?campanha=mentoria']").first()).toBeAttached(); // o download respeita o filtro da tela

  // 4) exclusão pelo modal
  await page.goto(`/admin/leads?q=${negocio}&campanha=mentoria`);
  await page.getByRole("link", { name: `Ver lead ${nome}` }).first().click();
  const d = page.getByRole("dialog", { name: nome });
  await expect(d).toBeVisible();
  await expect(d.getByText("Mentoria", { exact: true })).toBeVisible();
  await d.getByRole("link", { name: "Excluir…" }).click();
  await expect(d.getByRole("alertdialog", { name: "Excluir este lead?" })).toBeVisible();
  expect(await existe(negocio)).toBe(true);
  await d.getByRole("button", { name: "Sim, excluir" }).click();
  await expect(page).toHaveURL(/ok=excluido/);
  expect(await existe(negocio)).toBe(false);
});

test("CSV sem sessão = 401 mesmo com ?campanha=", async ({ request }) => {
  expect((await request.get("/admin/leads.csv?campanha=mentoria", { maxRedirects: 0 })).status()).toBe(401);
});
