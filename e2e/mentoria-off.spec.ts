// F10: formulário da mentoria DESLIGADO (MENTORIA_FORM_ATIVO=0, 2º webServer na porta 3001; projeto "mentoria-off").
// Sem <form>, "Em breve" e a action recusa sem gravar. Controle positivo: o MESMO payload na porta 3000 (flag =1) grava.
import { neon } from "@neondatabase/serverless";
import { expect, test } from "@playwright/test";
import { ipHmac } from "../app/_lib/seguranca";

const OFF = "http://localhost:3001";
const ON = "http://localhost:3000";
const IP = "203.0.113.88";
const NEGOCIO = "zz-teste-off-" + Date.now();
const sql = neon(process.env.DATABASE_URL ?? "");
const limpar = async () => {
  await sql`delete from lead where negocio like 'zz-teste-off-%'`;
  await sql`delete from rate_limit where ip_hmac = ${ipHmac(IP)}`;
};
test.afterEach(limpar);
test.afterAll(limpar);

test("desligado: nenhum <form>, 'Em breve', CTA em breve", async ({ page }) => {
  await page.goto(`${OFF}/mentoria`);
  await expect(page.locator("form")).toHaveCount(0);
  await expect(page.locator("#nm-form")).toHaveAttribute("data-form-ativo", "0");
  await expect(page.locator("#nm-form")).toContainText("Em breve");
  await expect(page.locator("#nm-form input, #nm-form button")).toHaveCount(0);
});

test("desligado: a action recusa sem gravar (payload válido; o mesmo payload grava com o flag ligado)", async ({ request }) => {
  const html = await (await request.get(`${ON}/mentoria`)).text();
  const ref = /name="\$ACTION_1:0" value="([^"]+)"/.exec(html)?.[1].replaceAll("&quot;", '"');
  expect(ref, "ação do formulário (porta 3000, flag=1) não encontrada").toBeTruthy();
  const multipart = {
    "$ACTION_REF_1": "", "$ACTION_1:0": ref!, "$ACTION_1:1": "[{}]", "$ACTION_KEY": "p/mentoria#lista",
    site: "", nome: "Teste Off", whatsapp: "14999990000", cidade: "Lins/SP", negocio: NEGOCIO, tempo: "1-3", equipe: "2-3",
    desafio: "equipe", consentimento: "on",
  };
  const headers = { "x-forwarded-for": IP, origin: OFF };
  const r1 = await request.post(`${OFF}/mentoria`, { multipart, headers });
  expect(r1.status()).toBeLessThan(500);
  expect(await sql`select 1 from lead where negocio = ${NEGOCIO}`).toHaveLength(0);

  const r2 = await request.post(`${ON}/mentoria`, { multipart, headers: { ...headers, origin: ON } });
  expect(r2.status()).toBeLessThan(500);
  expect(await sql`select 1 from lead where negocio = ${NEGOCIO}`).toHaveLength(1); // controle: o payload era válido
});
