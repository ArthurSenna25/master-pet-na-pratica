import { expect, test, type Page } from "@playwright/test";

// O pin é reavaliado em resize/orientationchange (debounce) e quando as fontes terminam de carregar: liga/desliga sem erro, sem pin-spacer órfão e sem salto.
const estado = (p: Page) => p.evaluate(() => ({
  dia: document.querySelector(".nm-dia")!.classList.contains("is-pinned"),
  tri: document.querySelector(".nm-trilha")!.classList.contains("is-pinned"),
  spacers: document.querySelectorAll(".pin-spacer").length,
  over: document.documentElement.scrollWidth > document.documentElement.clientWidth,
}));

test("redimensionar 1440x900 → 1366x657 → 1280x560 → 390x844 e voltar: pin liga/desliga, sem erro e sem pin-spacer", async ({ page }) => {
  const erros: string[] = [];
  page.on("pageerror", (e) => erros.push(`pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error" && !/report-only/.test(m.text())) erros.push(`console: ${m.text()}`); });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/mentoria");
  await page.waitForTimeout(2000);
  // [largura, altura, pin esperado] — critério: >=1091x590 ou >=900x640 (util.ts)
  const passos: [number, number, boolean][] = [[1440, 900, true], [1366, 657, true], [1280, 560, false], [390, 844, false], [1280, 560, false], [1366, 657, true], [1440, 900, true]];
  for (const [w, h, pin] of passos) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(900); // debounce 150 ms + refresh
    const s = await estado(page);
    expect(s, `${w}x${h}`).toEqual({ dia: pin, tri: pin, spacers: 0, over: false });
  }
  expect(erros).toEqual([]);
});

test("sem salto: a seção no topo da janela fica no lugar quando o pin liga/desliga (viewport fixo)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/mentoria");
  await page.waitForTimeout(2000);
  // abaixo do Dia e da Trilha, onde a troca pin/cards muda a altura de tudo acima
  await page.evaluate(() => { const e = document.getElementById("conteudo")!.children[3]; scrollTo(0, e.getBoundingClientRect().top + scrollY + 40); });
  await page.waitForTimeout(800);
  // muda o CSS e mede a âncora NA MESMA chamada (síncrono, antes do debounce da página): o deslocamento do próprio CSS não conta; só o que a troca pin/cards faz depois.
  const muda = (infla: boolean) => page.evaluate((on) => {
    if (on) {
      const s = document.createElement("style"); s.id = "infla";
      s.textContent = ".nm-diag__q p, .nm-out__d, .nm-pick, .nm-st p, .nm-st h3, .nm-beat p { font-size: 64px !important; line-height: 1.3 !important; min-height: 120px !important; }";
      document.head.append(s);
    } else document.getElementById("infla")!.remove();
    const filhos = [...document.getElementById("conteudo")!.children];
    const i = filhos.findIndex((c) => c.getBoundingClientRect().bottom > 1);
    window.dispatchEvent(new Event("resize"));
    return { i, top: Math.round(filhos[i].getBoundingClientRect().top) };
  }, infla);
  const topoDe = (i: number) => page.evaluate((k) => Math.round(document.getElementById("conteudo")!.children[k].getBoundingClientRect().top), i);
  const a1 = await muda(true); // pin → cards
  await page.waitForTimeout(1200);
  expect((await estado(page)).dia).toBe(false);
  expect(Math.abs((await topoDe(a1.i)) - a1.top)).toBeLessThanOrEqual(3);
  const a2 = await muda(false); // cards → pin
  await page.waitForTimeout(1200);
  expect((await estado(page)).dia).toBe(true);
  expect(Math.abs((await topoDe(a2.i)) - a2.top)).toBeLessThanOrEqual(3);
});

test("conteúdo que passa a não caber depois do pin ligado (fonte tardia): reavalia e cai para cards; ao caber de novo, religa", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/mentoria");
  await page.waitForTimeout(2000);
  expect(await estado(page)).toMatchObject({ dia: true, tri: true });
  // simula a troca tardia de métrica de fonte: texto maior injetado depois da hidratação + evento que a página escuta
  await page.evaluate(() => {
    const s = document.createElement("style");
    s.id = "infla";
    s.textContent = ".nm-diag__q p, .nm-out__d, .nm-pick, .nm-st p, .nm-st h3, .nm-beat p { font-size: 64px !important; line-height: 1.3 !important; min-height: 120px !important; }";
    document.head.append(s);
    window.dispatchEvent(new Event("resize"));
  });
  await page.waitForTimeout(1200);
  expect(await estado(page)).toEqual({ dia: false, tri: false, spacers: 0, over: false });
  await page.evaluate(() => { document.getElementById("infla")!.remove(); window.dispatchEvent(new Event("resize")); });
  await page.waitForTimeout(1200);
  expect(await estado(page)).toEqual({ dia: true, tri: true, spacers: 0, over: false });
});

test("fontes carregadas tarde: com os arquivos de fonte atrasados em 2,5 s o resultado final é o mesmo da medição (sem erro)", async ({ page }) => {
  const erros: string[] = [];
  page.on("pageerror", (e) => erros.push(e.message));
  await page.route(/\.(woff2?|ttf|otf)(\?.*)?$/, async (route) => { await new Promise((r) => setTimeout(r, 2500)); await route.continue(); });
  await page.setViewportSize({ width: 1366, height: 657 });
  await page.goto("/mentoria", { waitUntil: "commit" });
  await page.waitForFunction(() => document.fonts.status === "loaded", null, { timeout: 15_000 });
  await page.waitForTimeout(1500);
  const s = await estado(page);
  // 1366x657 cabe no pin com as fontes finais (pin-matriz); as fontes tardias não podem deixar um estado intermediário
  expect(s).toEqual({ dia: true, tri: true, spacers: 0, over: false });
  expect(erros).toEqual([]);
});
