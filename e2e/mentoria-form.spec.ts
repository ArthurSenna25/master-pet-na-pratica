// F10 c5: formulário de pré-inscrição da mentoria (2 passos) contra `next start` (MENTORIA_FORM_ATIVO=1 no webServer) e o branch "teste" do Neon.
// Tudo com prefixo "zz-teste-", apagado em afterEach/afterAll (o f4.spec exige rate_limit vazio).
import { neon } from "@neondatabase/serverless";
import { expect, test as base, type Page } from "@playwright/test";
import { CONSENTIMENTOS, LEGAL_TEXT_VERSION } from "../app/_lib/legal-version";
import { ipHmac, sha256Hex } from "../app/_lib/seguranca";

const PREFIXO = "zz-teste-";
const sql = neon(process.env.DATABASE_URL ?? "");
const IPS = [...Array.from({ length: 254 }, (_, i) => `203.0.113.${i + 1}`), "::1", "127.0.0.1", "::ffff:127.0.0.1"];

const test = base.extend({
  context: async ({ context }, entregar) => {
    await context.setExtraHTTPHeaders({ "x-forwarded-for": IPS[Math.floor(Math.random() * 254)] });
    await entregar(context);
  },
});

async function limpar() {
  const ids = (await sql`select id from lead where negocio like ${PREFIXO + "%"}`).map((r) => r.id as string);
  if (ids.length) {
    await sql`delete from audit_log where lead_id = any(${ids})`;
    await sql`delete from lead where id = any(${ids})`;
  }
  await sql`delete from rate_limit where ip_hmac = any(${IPS.map((ip) => ipHmac(ip))})`;
}
test.afterEach(limpar);
test.afterAll(limpar);

const sufixo = () => Array.from({ length: 8 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join("");
const leads = async () => (await sql`select * from lead where negocio like ${PREFIXO + "%"}`) as Record<string, unknown>[];

async function passo1(page: Page, nome: string) {
  await page.getByLabel("Nome", { exact: true }).fill(nome);
  await page.getByLabel("WhatsApp", { exact: true }).fill("14999990000");
  await page.getByRole("button", { name: "Continuar" }).click();
}
async function passo2(page: Page, negocio: string, desafio = "Equipe") {
  await page.getByLabel("Cidade/UF").fill("Lins/SP");
  await page.getByLabel("Nome do negócio").fill(negocio);
  await page.getByLabel("1 a 3 anos").check();
  await page.getByLabel("2 a 3", { exact: true }).check();
  if (desafio) await page.getByLabel(desafio, { exact: true }).check();
  await page.getByLabel(/Concordo em receber/).check();
}

test("texto do consentimento no DOM (passo 2) é idêntico a CONSENTIMENTOS.mentoria; links em nova aba", async ({ page }) => {
  await page.goto("/mentoria");
  const dom = await page.locator("label[for='f-consent']").evaluate((el) => (el as HTMLElement).textContent ?? "");
  expect(dom.replace(/\s+/g, " ").trim()).toBe(CONSENTIMENTOS.mentoria.replace(/\s+/g, " ").trim());
  const links = page.locator("label[for='f-consent'] a");
  await expect(links).toHaveCount(2);
  for (let i = 0; i < 2; i++) {
    await expect(links.nth(i)).toHaveAttribute("target", "_blank");
    await expect(links.nth(i)).toHaveAttribute("rel", /noopener/);
  }
  await expect(page.locator("#f-consent")).not.toBeChecked();
});

test("envio em 2 passos: lead da campanha mentoria; consentimento com hash e versão do texto da mentoria; origem sem query", async ({ page }) => {
  const negocio = `${PREFIXO}${sufixo()}`;
  await page.goto("/mentoria?origem=natal&email=a@b.c");
  await passo1(page, `${PREFIXO}${sufixo()}`);
  await expect(page.locator("#f-cidade")).toBeVisible();
  await expect(page.locator("#f-nome")).toBeHidden();
  await passo2(page, negocio);
  await page.locator("button[type=submit]").click();
  await expect(page.getByRole("heading", { name: "Pronto, você está na lista!" })).toBeVisible();

  const [l] = await leads();
  expect(l.negocio).toBe(negocio);
  expect(l.campanha).toBe("mentoria");
  expect(l.ja_fez_mentoria).toBeNull();
  expect(l.mensagem).toBeNull();
  expect(l.origem_campanha).toBe("natal");
  expect([l.tempo_funcionamento, l.pessoas, l.maior_desafio]).toEqual(["1 a 3 anos", "2 a 3", "Equipe"]);
  expect(l.whatsapp).toBe("14999990000");
  expect(l.origem).toBe("localhost:3000/mentoria"); // sem esquema, sem ?origem= nem e-mail
  const [e] = await sql`select * from consent_events where lead_id = ${l.id as string}`;
  expect(e.texto_versao).toBe(LEGAL_TEXT_VERSION);
  expect(e.texto_hash).toBe(sha256Hex(CONSENTIMENTOS.mentoria));
  expect(e.origem).toBe("localhost:3000/mentoria");
});

test("botão de envio desabilita durante o envio; duplo clique e dois submits na mesma tarefa criam UM lead", async ({ page }) => {
  for (const modo of ["dblclick", "requestSubmit"] as const) {
    const negocio = `${PREFIXO}${sufixo()}`;
    await page.goto("/mentoria");
    await passo1(page, `${PREFIXO}${sufixo()}`);
    await passo2(page, negocio);
    const botao = page.locator("button[type=submit]");
    if (modo === "dblclick") await botao.dblclick();
    else await page.locator("#nm-form").evaluate((f: HTMLFormElement) => { f.requestSubmit(); f.requestSubmit(); });
    await expect(page.getByRole("heading", { name: "Pronto, você está na lista!" })).toBeVisible();
    expect((await leads()).filter((l) => l.negocio === negocio)).toHaveLength(1);
  }
});

test("a trava de envio se libera depois de erro de validação e de erro do servidor: novo envio funciona", async ({ browser }) => {
  const ip = "203.0.113.201";
  const ctx = await browser.newContext({ extraHTTPHeaders: { "x-forwarded-for": ip } });
  const page = await ctx.newPage();
  const negocio = `${PREFIXO}${sufixo()}`;
  const hm = ipHmac(ip);
  try {
    await page.goto("/mentoria");
    await passo1(page, `${PREFIXO}${sufixo()}`);
    await passo2(page, negocio);
    // (a) erro de validação no cliente (sem consentimento): nada enviado, e o envio seguinte funciona
    await page.getByLabel(/Concordo em receber/).uncheck();
    await page.locator("button[type=submit]").click();
    await expect(page.locator("#e-consent span")).toContainText("consentimento");
    expect(await leads()).toHaveLength(0);
    // (b) erro do servidor: o limite por IP (5 em 10 min) já está esgotado
    await sql`insert into rate_limit (ip_hmac, campanha) select ${hm}, 'mentoria' from generate_series(1, 5)`;
    await page.getByLabel(/Concordo em receber/).check();
    await page.locator("button[type=submit]").click();
    await expect(page.getByRole("alert").filter({ hasText: "Muitos envios" })).toBeVisible();
    await expect(page.locator("button[type=submit]")).toBeEnabled();
    expect(await leads()).toHaveLength(0);
    // (c) o limite acaba: o mesmo formulário envia (a trava não ficou presa)
    await sql`delete from rate_limit where ip_hmac = ${hm}`;
    await expect(page.locator("#f-cidade")).toHaveValue("Lins/SP"); // o que foi digitado volta após erro do servidor
    await expect(page.getByLabel("1 a 3 anos")).toBeChecked();
    await expect(page.getByLabel(/Concordo em receber/)).not.toBeChecked(); // o consentimento nunca volta marcado depois de um erro do servidor
    await page.getByLabel(/Concordo em receber/).check();
    await page.locator("button[type=submit]").click();
    await expect(page.getByRole("heading", { name: "Pronto, você está na lista!" })).toBeVisible();
    expect((await leads()).filter((l) => l.negocio === negocio)).toHaveLength(1);
  } finally {
    await sql`delete from rate_limit where ip_hmac = ${hm}`;
    await ctx.close();
  }
});

test("durante o envio o botão fica desabilitado e o form aria-busy", async ({ page }) => {
  await page.route("**/mentoria", async (r) => { if (r.request().method() === "POST") await new Promise((ok) => setTimeout(ok, 1200)); await r.continue(); });
  await page.goto("/mentoria");
  await passo1(page, `${PREFIXO}${sufixo()}`);
  await passo2(page, `${PREFIXO}${sufixo()}`);
  await page.locator("button[type=submit]").click();
  await expect(page.locator("button[type=submit]")).toBeDisabled();
  await expect(page.locator("#nm-form")).toHaveAttribute("aria-busy", "true");
  await expect(page.getByRole("heading", { name: "Pronto, você está na lista!" })).toBeVisible();
});

test("passo 1 inválido: mostra o erro e não avança", async ({ page }) => {
  await page.goto("/mentoria");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.locator("#e-f-nome span")).not.toBeEmpty();
  await expect(page.locator("#f-cidade")).toBeHidden();
  expect(await leads()).toHaveLength(0);
});

test("passo 2 sem consentimento: erro e nada gravado", async ({ page }) => {
  const negocio = `${PREFIXO}${sufixo()}`;
  await page.goto("/mentoria");
  await passo1(page, `${PREFIXO}${sufixo()}`);
  await passo2(page, negocio);
  await page.getByLabel(/Concordo em receber/).uncheck();
  await page.locator("button[type=submit]").click();
  await expect(page.locator("#e-consent span")).toContainText("consentimento");
  expect(await leads()).toHaveLength(0);
});

test("diagnóstico pré-seleciona o maior desafio no cliente e NÃO envia nada", async ({ page }) => {
  const posts: string[] = [];
  page.on("request", (r) => r.method() === "POST" && posts.push(r.url()));
  await page.goto("/mentoria");
  // com o pin do "Um dia na bancada" (>=900x720) o Diagnóstico só aparece às 18h, no fim do percurso: rola até lá
  await expect(page.locator(".nm-dia.is-pinned")).toHaveCount(1); // espera a hidratação (a seção só ganha o percurso do pin depois dela; viewport padrão 1280x720 = pin)
  await page.evaluate(() => { const s = document.querySelector("#dia") as HTMLElement; window.scrollTo(0, s.offsetTop + s.offsetHeight - window.innerHeight); });
  await expect(page.locator(".nm-diag")).toBeVisible();
  await page.locator("a.nm-pick[data-desafio='preco']").click();
  await expect(page.locator("a.nm-pick[data-desafio='preco']")).toHaveAttribute("aria-current", "true");
  await passo1(page, `${PREFIXO}${sufixo()}`);
  await expect(page.getByLabel("Precificação", { exact: true })).toBeChecked();
  await expect(page.getByText("Pré-selecionado pela sua escolha")).toBeVisible();
  await page.getByLabel("Equipe", { exact: true }).check(); // o usuário pode mudar; o aviso some
  await expect(page.getByText("Pré-selecionado pela sua escolha")).toBeHidden();
  expect(posts).toEqual([]);
  expect(await leads()).toHaveLength(0);
});

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("os dois passos aparecem juntos e o envio funciona (Server Action com permalink)", async ({ page }) => {
    const negocio = `${PREFIXO}${sufixo()}`;
    await page.goto("/mentoria");
    await expect(page.locator("#f-nome")).toBeVisible();
    await expect(page.locator("#f-cidade")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continuar" })).toBeHidden();
    await page.getByLabel("Nome", { exact: true }).fill(`${PREFIXO}${sufixo()}`);
    await page.getByLabel("WhatsApp", { exact: true }).fill("(14) 99999-0000");
    await passo2(page, negocio);
    await page.locator("button[type=submit]").click();
    await expect(page.getByRole("heading", { name: "Pronto, você está na lista!" })).toBeVisible();
    const [l] = await leads();
    expect(l.campanha).toBe("mentoria");
  });
});
