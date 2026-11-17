// Verificação da cena Trilha (/mentoria). Uso: node qa/trilha-check.mjs [url]  (servidor em pé; capturas em qa/shots/f10/trilha/)
import { chromium, webkit } from "@playwright/test";
import { mkdirSync } from "node:fs";

const url = process.argv[2] ?? "http://localhost:3000/mentoria";
const OUT = "qa/shots/f10/trilha";
mkdirSync(OUT, { recursive: true });
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); console.log(c ? "ok  " : "FAIL", m); };
const ERRO_CSP = /report-only mode/;

// [rótulo, largura CSS, altura CSS, esperaPin]  (125% = viewport CSS dividido por 1,25)
const CASOS = [
  ["1366x768@100", 1366, 768, true], ["1366x768@125", 1093, 614, false],
  ["1440x900@100", 1440, 900, true], ["1440x900@125", 1152, 720, true],
  ["390x844", 390, 844, false],
];

const estado = (p) => p.evaluate(() => {
  const s = document.querySelector(".nm-trilha");
  const cards = [...s.querySelectorAll(".nm-st")];
  const sp = null; // pin por position: sticky: não há pin-spacer; a seção pinada tem 200svh e o conteúdo gruda
  const prev = (sp ?? s).previousElementSibling, next = (sp ?? s).nextElementSibling;
  const R = (e) => e.getBoundingClientRect();
  return {
    pinned: s.classList.contains("is-pinned"), spacer: getComputedStyle(s.querySelector(".nm-trilha__pin")).position === "sticky", ribbonKids: s.querySelector(".nm-ribbon").childElementCount,
    navVisible: getComputedStyle(s.querySelector(".nm-stnav")).display !== "none",
    opac: cards.map((c) => +getComputedStyle(c).opacity), vis: cards.filter((c) => c.getBoundingClientRect().width > 0 && getComputedStyle(c).visibility !== "hidden").length,
    overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    secH: R(s).height, vh: innerHeight, secScroll: s.scrollHeight, pinH: s.querySelector('.nm-trilha__pin').clientHeight, pinScroll: s.querySelector('.nm-trilha__pin').scrollHeight,
    gapAntes: prev ? Math.round(R(sp ?? s).top - R(prev).bottom) : 0, gapDepois: next ? Math.round(R(next).top - R(sp ?? s).bottom) : 0,
    spTop: sp ? Math.round(R(sp).top + scrollY) : Math.round(R(s).top + scrollY), spH: Math.round(R(s).height),
  };
});

for (const [nome, tipo] of [["chromium", chromium], ["webkit", webkit]]) {
  const b = await tipo.launch();
  const novo = async (w, h, opt = {}) => {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 900, ...opt });
    const p = await ctx.newPage(); const errs = [];
    p.on("console", (m) => m.type() === "error" && !ERRO_CSP.test(m.text()) && errs.push(m.text()));
    p.on("pageerror", (e) => errs.push(String(e)));
    return { ctx, p, errs };
  };

  // 1) reduced-motion = estático (ANTES): sem pin, sem fita, sem nav, 6 cartões visíveis
  for (const [rot, w, h] of [["1440x900", 1440, 900], ["390x844", 390, 844]]) {
    const { ctx, p, errs } = await novo(w, h, { reducedMotion: "reduce" });
    await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(1500);
    const s = await estado(p), tag = `${nome} ${rot} reduced`;
    ok(!s.pinned && !s.spacer && s.ribbonKids === 0 && !s.navVisible, `${tag}: estático (sem pin, fita nem nav)`);
    ok(s.opac.every((o) => o === 1) && s.vis === 6 && !s.overflowX, `${tag}: 6 estações visíveis (opacity 1), sem overflow`);
    ok(errs.length === 0, `${tag}: sem erro de console ${errs[0] ?? ""}`);
    await p.locator("#trilha").scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
    await p.locator("#trilha").screenshot({ path: `${OUT}/${nome}-antes-${w}.png` });
    await ctx.close();
  }

  // 2) sem JS: 6 estações legíveis
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const { ctx, p } = await novo(w, h, { javaScriptEnabled: false });
    await p.goto(url, { waitUntil: "load" });
    const t = await p.locator(".nm-st").allInnerTexts();
    ok(t.length === 6 && t.every((x) => x.trim().length > 20), `${nome} semJS ${w}: 6 estações com texto`);
    ok(await p.locator(".nm-st").evaluateAll((cs) => cs.every((c) => getComputedStyle(c).opacity === "1" && c.getBoundingClientRect().width > 0)), `${nome} semJS ${w}: todas visíveis`);
    await ctx.close();
  }

  // 3) com movimento: pin só em >=900x720; vão; layout; capturas
  for (const [rot, w, h, pin] of CASOS) {
    const { ctx, p, errs } = await novo(w, h);
    await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(2000);
    const tag = `${nome} ${rot}`;
    let s = await estado(p);
    ok(s.pinned === pin && s.spacer === pin, `${tag}: pin ${pin ? "ligado" : "desligado"} (is-pinned=${s.pinned}, spacer=${s.spacer})`);
    ok(!s.overflowX, `${tag}: sem overflow horizontal`);
    ok(errs.length === 0, `${tag}: sem erro de console ${errs[0] ?? ""}`);
    if (pin) {
      ok(s.pinH <= s.vh + 1 && s.pinScroll <= s.pinH + 1, `${tag}: seção pinada cabe na tela (seção=${Math.round(s.secH)}, conteúdo=${s.pinScroll}/${s.pinH}, vh=${s.vh}; o fundo ambiente inset:-3% é cortado)`);
      ok(Math.abs(s.gapAntes) <= 1 && Math.abs(s.gapDepois) <= 1, `${tag}: sem vão (antes=${s.gapAntes}px, depois=${s.gapDepois}px)`);
      await p.evaluate((y) => scrollTo(0, y), s.spTop); await p.waitForTimeout(1200);
      for (const k of [0, 2, 5]) {
        if (k) { await p.locator(`[data-st-go="${k + 1}"]`).click(); await p.waitForTimeout(2800); }
        const o = await p.evaluate(() => [...document.querySelectorAll(".nm-st")].map((c) => +getComputedStyle(c).opacity.slice(0, 4)));
        const cur = await p.locator(`[data-st-go="${k + 1}"]`).getAttribute("aria-current");
        ok(o[k] >= 0.95 && cur === "true", `${tag}: estação ${k + 1} em foco pela nav (opacity ${o[k]}, aria-current=${cur})`);
        if (rot === "1440x900@100" || rot === "1366x768@100") await p.screenshot({ path: `${OUT}/${nome}-depois-${rot}-est${k + 1}.png` });
      }
      await p.evaluate((y) => scrollTo(0, y), s.spTop + s.spH + 40); await p.waitForTimeout(800);
      ok((await estado(p)).gapDepois === (await estado(p)).gapDepois, `${tag}: depois do pin a rolagem segue`);
    } else {
      ok(s.vis === 6 && !s.overflowX, `${tag}: 6 estações no fluxo, sem pin`);
      await p.locator("#trilha").scrollIntoViewIfNeeded(); await p.waitForTimeout(1800);
      s = await estado(p);
      ok(s.opac.every((o) => o > 0.95), `${tag}: cartões visíveis depois de rolar (${s.opac.map((o) => o.toFixed(2)).join(",")})`);
      if (w === 390) await p.locator("#trilha").screenshot({ path: `${OUT}/${nome}-depois-390.png` });
    }
    await ctx.close();
  }
  await b.close();
}

// 4) CLS e LCP (chromium; desktop sem throttle e mobile com CPU 4x), 3 rodadas
const b = await chromium.launch();
for (const [rot, w, h, mobile, rate] of [["1440x900", 1440, 900, false, 1], ["390x844", 390, 844, true, 4]]) {
  for (let i = 0; i < 3; i++) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: mobile, isMobile: mobile });
    const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate });
    await p.addInitScript(() => {
      window.__v = { lcp: 0, cls: 0 };
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__v.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__v.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
    });
    await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(3000);
    const carga = await p.evaluate(() => window.__v.cls);
    ok(carga === 0, `chromium ${rot} (CPU ${rate}x) #${i + 1}: CLS na carga = ${carga.toFixed(4)}`);
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 400) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(60); }
    await p.waitForTimeout(800);
    const v = await p.evaluate(() => window.__v);
    ok(v.lcp <= 2500, `chromium ${rot} (CPU ${rate}x) #${i + 1}: LCP ${Math.round(v.lcp)} ms, CLS com rolagem sintética (informativo) ${v.cls.toFixed(4)}`);
    await ctx.close();
  }
}
await b.close();
console.log(fails.length ? `\n${fails.length} FALHA(S)` : "\ntudo ok");
process.exit(fails.length ? 1 : 0);
