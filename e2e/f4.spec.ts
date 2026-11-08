// F4 E2E contra `next start` (porta 3000) e o branch "teste" do Neon. Tudo que criam tem prefixo "zz-teste-" e é apagado em afterEach/afterAll.
import { neon } from "@neondatabase/serverless";
import { expect, test as base, type APIRequestContext, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { CONSENT_TEXT, LEGAL_TEXT_VERSION } from "../app/_lib/legal-version";
import { ipHmac, sha256Hex } from "../app/_lib/seguranca";

const PREFIXO = "zz-teste-";
const sql = neon(process.env.DATABASE_URL ?? "");
// 203.0.113.0/24 = TEST-NET-3. A limpeza cobre o bloco inteiro: um worker reiniciado após falha perderia um Set em memória.
const IPS_DE_TESTE = [...Array.from({ length: 254 }, (_, i) => `203.0.113.${i + 1}`), "::1", "127.0.0.1", "::ffff:127.0.0.1"]; // + loopback: o next start injeta x-forwarded-for do socket
const novoIp = () => IPS_DE_TESTE[Math.floor(Math.random() * IPS_DE_TESTE.length)];

const test = base.extend<{ ip: string }>({
  ip: async ({ context }, entregar) => {
    const ip = novoIp();
    await context.setExtraHTTPHeaders({ "x-forwarded-for": ip }); // em produção o servidor exige o header do proxy
    await entregar(ip);
  },
});

async function limpar() {
  const ids = (await sql`select id from lead where nome like ${PREFIXO + "%"}`).map((r) => r.id as string);
  if (ids.length) {
    await sql`delete from audit_log where lead_id = any(${ids})`;
    await sql`delete from lead where id = any(${ids})`; // consent_events sai por cascade
  }
  await sql`delete from rate_limit where ip_hmac = any(${IPS_DE_TESTE.map((ip) => ipHmac(ip))})`;
  await sql`delete from "user" where email like ${PREFIXO + "%"}`;
}
test.afterEach(limpar);
test.afterAll(async () => {
  await limpar();
  const [r] = await sql`select (select count(*)::int from lead where nome like ${PREFIXO + "%"}) leads, (select count(*)::int from rate_limit) limite`;
  expect(r.leads).toBe(0);
  expect(r.limite).toBe(0);
});

const nomeUnico = () => `${PREFIXO}${randomUUID().slice(0, 8)}`;
const contar = async (nome: string) => Number((await sql`select count(*)::int c from lead where nome = ${nome}`)[0].c);

// ---------- UI ----------
async function passo1(page: Page, nome: string) {
  await page.getByLabel("Nome", { exact: true }).fill(nome);
  await page.getByLabel("WhatsApp", { exact: true }).fill("(14) 99999-0000");
}
async function passo2(page: Page) {
  await page.getByLabel("Cidade/UF").fill("Lins/SP");
  await page.getByLabel("Nome do negócio").fill(`${PREFIXO}negocio`);
  await page.getByText("1 a 3 anos", { exact: true }).click();
  await page.getByText("2 a 3", { exact: true }).click();
}
async function passo3(page: Page) {
  await page.getByText("Equipe", { exact: true }).click();
  await page.getByText("Sim", { exact: true }).click();
  await page.locator("#consent").check();
}
const continuar = (page: Page) => page.getByRole("button", { name: "Continuar" }).filter({ visible: true }).click();

test.describe("formulário (com JS)", () => {
  test("3 passos -> lead + consent_events com versão e hash corretos; sucesso com foco", async ({ page, ip }) => {
    const nome = nomeUnico();
    await page.goto("/");
    await page.locator("#conversar").scrollIntoViewIfNeeded();
    await expect(page.locator("#lp-form.is-steps")).toBeVisible();
    await expect(page.getByText("demonstração: use dados fictícios")).toBeVisible();
    await expect(page.getByText("Passo 1 de 3 · Contato")).toBeVisible();
    await passo1(page, nome);
    await continuar(page);
    await expect(page.getByText("Passo 2 de 3 · Seu negócio")).toBeVisible();
    await passo2(page);
    await continuar(page);
    await expect(page.getByText("Passo 3 de 3 · Seu momento")).toBeVisible();
    await passo3(page);
    await page.getByRole("button", { name: "Quero conversar com a Camila" }).click();

    const sucesso = page.locator(".lp-success");
    await expect(sucesso).toBeVisible();
    await expect(sucesso).toHaveAttribute("role", "status");
    await expect(sucesso).toBeFocused();

    const [l] = await sql`select * from lead where nome = ${nome}`;
    expect(l.whatsapp).toBe("14999990000");
    expect(l.ja_fez_mentoria).toBe(true);
    const [e] = await sql`select * from consent_events where lead_id = ${l.id}`;
    expect(e.tipo).toBe("aceite");
    expect(e.texto_versao).toBe(LEGAL_TEXT_VERSION);
    expect(e.texto_hash).toBe(sha256Hex(CONSENT_TEXT));
    expect(e.ip_hmac).toBe(ipHmac(ip));
    expect(e.ip_hmac).not.toContain(ip);
  });

  test("Continuar valida só o passo atual e foca o 1º inválido; Voltar não valida", async ({ page }) => {
    await page.goto("/");
    await page.locator("#conversar").scrollIntoViewIfNeeded();
    await continuar(page);
    await expect(page.getByText("Informe seu nome.")).toBeVisible();
    await expect(page.getByText("Passo 1 de 3 · Contato")).toBeVisible();
    await expect(page.getByLabel("Nome", { exact: true })).toBeFocused();
    await passo1(page, nomeUnico());
    await continuar(page);
    await expect(page.getByText("Passo 2 de 3 · Seu negócio")).toBeVisible();
    await page.getByRole("button", { name: "Voltar" }).filter({ visible: true }).click(); // sem validar o passo 2 vazio
    await expect(page.getByText("Passo 1 de 3 · Contato")).toBeVisible();
    await expect(page.getByText("Informe a cidade/UF.")).toHaveCount(0);
  });

  test("erro do servidor abre o passo do 1º campo inválido e foca", async ({ page }) => {
    await page.goto("/");
    await page.locator("#conversar").scrollIntoViewIfNeeded();
    await passo1(page, "x".repeat(101)); // passa no navegador (>= 2), o Zod do servidor rejeita (> 100)
    await continuar(page);
    await passo2(page);
    await continuar(page);
    await passo3(page);
    await page.getByRole("button", { name: "Quero conversar com a Camila" }).click();
    await expect(page.getByText("Passo 1 de 3 · Contato")).toBeVisible();
    await expect(page.getByText("Informe seu nome.")).toBeVisible();
    await expect(page.getByLabel("Nome", { exact: true })).toBeFocused();
    await expect(page.locator(".lp-success")).toBeHidden();
  });

  test("texto do consentimento no DOM é idêntico a CONSENT_TEXT; links em nova aba", async ({ page }) => {
    await page.goto("/");
    const dom = await page.locator(".lp-consent span").evaluate((el) => el.textContent ?? "");
    expect(dom.replace(/\s+/g, " ").trim()).toBe(CONSENT_TEXT.replace(/\s+/g, " ").trim());
    await expect(page.locator("#consent")).not.toBeChecked();
    for (const href of ["/politica-de-privacidade", "/termos-de-uso"]) {
      const a = page.locator(`.lp-consent a[href="${href}"]`);
      await expect(a).toHaveAttribute("target", "_blank");
      await expect(a).toHaveAttribute("rel", /noopener/);
    }
  });
});

test.describe("formulário (JavaScript desligado)", () => {
  test.use({ javaScriptEnabled: false });
  test("os 3 passos aparecem juntos e o envio grava o lead", async ({ page }) => {
    const nome = nomeUnico();
    await page.goto("/");
    await expect(page.locator("#lp-form")).not.toHaveClass(/is-steps/);
    await expect(page.getByLabel("Cidade/UF")).toBeVisible(); // passo 2 visível junto
    await passo1(page, nome);
    await passo2(page);
    await passo3(page);
    await Promise.all([page.waitForNavigation(), page.getByRole("button", { name: "Quero conversar com a Camila" }).click()]);
    await expect(page.locator("#lp-form.is-done .lp-success")).toBeVisible();
    expect(await contar(nome)).toBe(1);
  });
});

// ---------- POST direto (sem navegador) ----------
const VALIDO = (nome: string): Record<string, string> => ({
  nome, whatsapp: "14999990000", cidade: "Lins/SP", negocio: `${PREFIXO}negocio`,
  tempo: "1 a 3 anos", equipe: "2 a 3", desafio: "Equipe", curso: "Sim", consentimento: "on", site: "",
});

const decodificar = (s: string) => s.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

/** Campos ocultos ($ACTION_*) que o Next põe no <form> renderizado no servidor. */
async function camposDaAction(request: APIRequestContext): Promise<Record<string, string>> {
  const html = await (await request.get("/")).text();
  const form = html.slice(html.indexOf('id="lp-form"'));
  const out: Record<string, string> = {};
  for (const tag of form.match(/<input[^>]*type="hidden"[^>]*>/g) ?? []) {
    const nome = /name="([^"]+)"/.exec(tag)?.[1];
    if (nome?.startsWith("$ACTION")) out[decodificar(nome)] = decodificar(/value="([^"]*)"/.exec(tag)?.[1] ?? "");
  }
  expect(Object.keys(out).length).toBeGreaterThan(0);
  return out;
}

async function postar(request: APIRequestContext, campos: Record<string, string>, ip?: string) {
  const base = await camposDaAction(request);
  const res = await request.post("/", {
    multipart: { ...base, ...campos },
    headers: { origin: "http://localhost:3000", ...(ip ? { "x-forwarded-for": ip } : {}) },
  });
  return { status: res.status(), html: await res.text() };
}

test.describe("POST direto na action", () => {
  test.beforeEach(({ browserName }) => test.skip(browserName !== "chromium", "mesma lógica de servidor; roda uma vez"));

  test("inválido -> erro de validação e nada gravado", async ({ request, ip }) => {
    const nome = nomeUnico();
    const r = await postar(request, { ...VALIDO(nome), tempo: "inventado", consentimento: "" }, ip);
    expect(r.html).toContain("Escolha uma opção.");
    expect(r.html).toContain("Para enviar, é preciso concordar com o contato.");
    expect(await contar(nome)).toBe(0);
  });

  test("honeypot preenchido -> sucesso genérico e nada gravado", async ({ request, ip }) => {
    const nome = nomeUnico();
    const r = await postar(request, { ...VALIDO(nome), site: "http://spam" }, ip);
    expect(r.html).toContain("Recebemos sua mensagem!");
    expect(await contar(nome)).toBe(0);
  });

  test("6º envio do mesmo IP em 10 min é bloqueado", async ({ request, ip }) => {
    const nomes = Array.from({ length: 6 }, nomeUnico);
    for (const n of nomes.slice(0, 5)) {
      const ok = await postar(request, VALIDO(n), ip);
      expect(ok.html).toContain("is-done");
    }
    const sexto = await postar(request, VALIDO(nomes[5]), ip);
    expect(sexto.html).toContain("Muitos envios em pouco tempo");
    expect(await contar(nomes[5])).toBe(0);
    for (const n of nomes.slice(0, 5)) expect(await contar(n)).toBe(1);
  });

});

// ---------- admin ----------
test.describe("admin", () => {
  test("/admin sem sessão redireciona ao login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
  });

  test("sign-up inacessível e nenhum usuário criado", async ({ request, browserName }) => {
    test.skip(browserName !== "chromium", "roda uma vez");
    const antes = Number((await sql`select count(*)::int c from "user"`)[0].c);
    const res = await request.post("/api/auth/sign-up/email", {
      headers: { origin: "http://localhost:3000", "x-forwarded-for": novoIp() },
      data: { email: `${PREFIXO}x@example.test`, password: "senha-bem-longa-123", name: `${PREFIXO}x` },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
    expect(Number((await sql`select count(*)::int c from "user"`)[0].c)).toBe(antes);
  });
});
