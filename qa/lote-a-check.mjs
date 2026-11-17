// Lote A da /mentoria: Abertura, Um dia na bancada e realce do Diagnostico sobre a trilha. Uso: node qa/lote-a-check.mjs [url] [sufixo]
// Servidor em pe (build + start, MENTORIA_FORM_ATIVO=1). Capturas em qa/shots/f10/lote-a/ (<sufixo>-...). 125% = viewport CSS / 1,25.
import { chromium, webkit } from "@playwright/test";
import { mkdirSync } from "node:fs";

const url = process.argv[2] ?? "http://localhost:3000/mentoria";
const TAG = process.argv[3] ?? "depois";
const OUT = "qa/shots/f10/lote-a";
mkdirSync(OUT, { recursive: true });
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); console.log(c ? "ok  " : "FAIL", m); };
const ERRO_CSP = /report-only mode/;
// [rotulo, w, h, pin esperado (>=900x720)]
const CASOS = [["1366x768@100", 1366, 768, true], ["1366x768@125", 1093, 614, false], ["1440x900@100", 1440, 900, true], ["1440x900@125", 1152, 720, true], ["390x844", 390, 844, false]];

const sleep = (p, ms) => p.waitForTimeout(ms);
const topAbs = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s), sp = e.parentElement.classList.contains("pin-spacer") ? e.parentElement : e; return Math.round(sp.getBoundingClientRect().top + scrollY); }, sel);
const novo = async (b, w, h, opt = {}) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 900, ...opt });
  const p = await ctx.newPage(); const errs = [];
  p.on("console", (m) => m.type() === "error" && !ERRO_CSP.test(m.text()) && errs.push(m.text()));
  p.on("pageerror", (e) => errs.push(String(e)));
  return { ctx, p, errs };
};

for (const [nome, tipo] of [["chromium", chromium], ["webkit", webkit]]) {
  const b = await tipo.launch();

  // 1) sem JS: tudo legivel (titulo, dores, diagnostico, estacoes)
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const { ctx, p } = await novo(b, w, h, { javaScriptEnabled: false });
    await p.goto(url, { waitUntil: "load" }); await sleep(p, 1500);
    const r = await p.evaluate(() => {
      const vis = (s) => [...document.querySelectorAll(s)].every((e) => { const c = getComputedStyle(e); return +c.opacity === 1 && c.visibility === "visible" && e.getBoundingClientRect().width > 0; });
      return { h1: vis(".nm-h1"), beats: vis(".nm-beat"), diag: vis(".nm-diag"), st: vis(".nm-st"), clock: getComputedStyle(document.querySelector(".nm-clock")).display };
    });
    ok(r.h1 && r.beats && r.diag && r.st && r.clock === "none", `${nome} semJS ${w}: titulo, dores, diagnostico e estacoes visiveis (${JSON.stringify(r)})`);
    await ctx.close();
  }

  // 2) reduced-motion: estatico (sem pin, sem relogio, sem animacao, sem paralaxe), mas o realce do Diagnostico funciona
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const { ctx, p, errs } = await novo(b, w, h, { reducedMotion: "reduce" });
    await p.goto(url, { waitUntil: "load" }); await sleep(p, 1200);
    const r = await p.evaluate(() => ({
      h1: +getComputedStyle(document.querySelector(".nm-h1")).opacity, anim: getComputedStyle(document.querySelector(".nm-h1")).animationName,
      pinned: document.querySelector(".nm-dia").classList.contains("is-pinned"), spacer: !!document.querySelector(".pin-spacer"),
      beats: [...document.querySelectorAll(".nm-beat")].every((e) => +getComputedStyle(e).opacity === 1 && getComputedStyle(e).visibility === "visible"),
      foto: getComputedStyle(document.querySelector(".nm-hero__photo img")).transform,
    }));
    ok(r.h1 === 1 && r.anim === "none" && !r.pinned && !r.spacer && r.beats && (r.foto === "none" || /^matrix\(1, 0, 0, 1, 0, 0\)$/.test(r.foto)), `${nome} reduced ${w}: estatico (${JSON.stringify(r)})`);
    await p.locator('.nm-pick[data-desafio="preco"]').click();
    ok(await p.locator('.nm-st[data-st="4"].is-hit').count() === 1 && await p.locator('.nm-st[data-st="2"].is-hit').count() === 0, `${nome} reduced ${w}: realce acende a estacao 4 e so ela`);
    ok(errs.length === 0, `${nome} reduced ${w}: sem erro de console ${errs[0] ?? ""}`);
    await ctx.close();
  }

  // 3) com movimento
  for (const [rot, w, h, pin] of CASOS) {
    const { ctx, p, errs } = await novo(b, w, h);
    const tag = `${nome} ${rot}`;
    await p.goto(url, { waitUntil: "commit" });
    // Abertura: nada acima da dobra escondido por JS (inline opacity/visibility) em NENHUM momento depois do DOM pronto
    await p.waitForLoadState("domcontentloaded");
    const escondidoPorJs = await p.evaluate(() => [...document.querySelectorAll(".nm-hero [style]")].filter((e) => /opacity:\s*0|visibility:\s*hidden/.test(e.getAttribute("style") ?? "")).length);
    await p.waitForLoadState("load"); await sleep(p, 1800);
    ok(escondidoPorJs === 0, `${tag}: abertura sem estilo oculto inline no DOM pronto (${escondidoPorJs})`);
    const a = await p.evaluate(() => ({ h1: +getComputedStyle(document.querySelector(".nm-h1")).opacity, anim: getComputedStyle(document.querySelector(".nm-h1")).animationName, inl: document.querySelector(".nm-h1").getAttribute("style") }));
    ok(a.h1 === 1 && a.anim === "nm-in" && !a.inl, `${tag}: titulo entra por keyframes de CSS e termina visivel (${JSON.stringify(a)})`);
    await p.screenshot({ path: `${OUT}/${TAG}-${nome}-${rot}-abertura.png` });
    if (w >= 900) {
      const px = await p.evaluate(() => { const c = document.querySelector(".nm-sparkles"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n; });
      ok(px > 0, `${tag}: poeira desenhada no canvas (${px} px)`);
    }
    await p.evaluate(() => scrollTo(0, 420)); await sleep(p, 700);
    const tr = await p.evaluate(() => getComputedStyle(document.querySelector(".nm-hero__photo img")).transform);
    ok(tr !== "none", `${tag}: paralaxe do retrato com a rolagem (${tr.slice(0, 40)})`);
    await p.evaluate(() => scrollTo(0, 0));

    // Dia
    const est = await p.evaluate(() => ({ pinned: document.querySelector(".nm-dia").classList.contains("is-pinned"), over: document.documentElement.scrollWidth > document.documentElement.clientWidth }));
    ok(est.pinned === pin && !est.over, `${tag}: dia ${pin ? "com pin" : "sem pin"} e sem overflow horizontal (${JSON.stringify(est)})`);
    if (pin) {
      const fit = await p.evaluate(() => { const e = document.querySelector(".nm-dia__pin"); return [e.scrollHeight, e.clientHeight, getComputedStyle(e).position, innerHeight]; });
      ok(fit[0] <= fit[1] + 1 && fit[1] <= fit[3] + 1 && fit[2] === "sticky", `${tag}: dia pinado (sticky) cabe na tela (conteudo=${fit[0]}/${fit[1]}, vh=${fit[3]})`);
      const top = await topAbs(p, ".nm-dia"), faixa = h * 0.9, horas = [], beats = [];
      for (let i = 0; i <= 24; i++) {
        await p.evaluate((y) => scrollTo(0, y), top + (faixa * i) / 24); await sleep(p, 330);
        const s = await p.evaluate(() => ({ hora: document.querySelector("[data-nm-clock]").textContent, vis: [...document.querySelectorAll(".nm-beat")].filter((e) => +getComputedStyle(e).opacity > 0.5 && getComputedStyle(e).visibility !== "hidden").map((e) => e.dataset.h) }));
        horas.push(+s.hora); beats.push(s.vis);
        if ([3, 10, 17].includes(i)) await p.screenshot({ path: `${OUT}/${TAG}-${nome}-${rot}-dia-${String(i).padStart(2, "0")}.png` });
      }
      ok(horas[0] === 8 && horas.at(-1) === 18 && horas.every((v, i) => i === 0 || (v >= horas[i - 1] && v - horas[i - 1] <= 1)), `${tag}: relogio 08→18 crescente, de hora em hora (${[...new Set(horas)].join(",")})`);
      ok(beats.every((v) => v.length <= 1) && ["8", "11", "14", "16"].every((x) => beats.some((v) => v[0] === x)), `${tag}: uma dor por vez, nas horas 8/11/14/16 (${beats.map((v) => v[0] ?? "-").join("")})`);
      await sleep(p, 600);
      const fim = await p.evaluate(() => ({ diag: +getComputedStyle(document.querySelector(".nm-diag")).opacity, palco: +getComputedStyle(document.querySelector(".nm-dia__stage")).opacity }));
      ok(fim.diag > 0.95 && fim.palco < 0.05, `${tag}: as 18h o diagnostico assume o palco (${JSON.stringify(fim)})`);
      // realce: clicar numa opcao acende cartao e botao; com a cena pinada, o no da fita
      await p.locator('.nm-pick[data-desafio="equipe"]').click();
      const t3 = await topAbs(p, ".nm-trilha"), tr0 = await p.evaluate(() => { const s = document.querySelector(".nm-trilha"); return s.parentElement.classList.contains("pin-spacer") ? s.parentElement.getBoundingClientRect().height : s.getBoundingClientRect().height; });
      await p.evaluate((y) => scrollTo(0, y), t3); await sleep(p, 1200);
      await p.locator('[data-st-go="3"]').click(); await sleep(p, 2800);
      const r = await p.evaluate(() => ({ cartao: document.querySelector('.nm-st[data-st="3"]').classList.contains("is-hit"), outro: document.querySelectorAll(".nm-st.is-hit").length, botao: document.querySelector('[data-st-go="3"]').classList.contains("is-hit"), no: [...document.querySelectorAll('.nm-ribbon circle[stroke-dasharray="6 7"]')].map((c) => c.getAttribute("opacity")) }));
      ok(r.cartao && r.outro === 1 && r.botao && r.no[2] === "1" && r.no.filter((x) => x === "1").length === 1, `${tag}: realce Diagnostico→trilha (cartao, botao e no da fita da estacao 3; ${JSON.stringify(r)}; trilha ${Math.round(tr0)}px)`);
      if (rot === "1440x900@100" || rot === "1366x768@100") await p.screenshot({ path: `${OUT}/${TAG}-${nome}-${rot}-realce.png` });
    } else {
      await p.locator(".nm-dia").scrollIntoViewIfNeeded(); await sleep(p, 1800);
      const bs = await p.evaluate(() => [...document.querySelectorAll(".nm-beat")].map((e) => +getComputedStyle(e).opacity.slice(0, 4)));
      ok(bs.every((o) => o > 0.95), `${tag}: dores visiveis depois de rolar (${bs.join(",")})`);
      await p.locator('.nm-pick[data-desafio="preco"]').click();
      ok(await p.locator('.nm-st[data-st="4"].is-hit').count() === 1, `${tag}: realce acende a estacao 4`);
      await p.screenshot({ path: `${OUT}/${TAG}-${nome}-${rot}-dia.png` });
    }
    ok(errs.length === 0, `${tag}: sem erro de console ${errs[0] ?? ""}`);
    await ctx.close();
  }
  await b.close();
}
console.log(fails.length ? `\n${fails.length} FALHA(S)` : "\ntudo ok");
process.exit(fails.length ? 1 : 0);
