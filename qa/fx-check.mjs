// Asserções da F3-motion. Uso: node qa/fx-check.mjs [url]  (servidor em pé; screenshots em qa/out/)
import { chromium, webkit } from "@playwright/test";
import { mkdirSync } from "node:fs";

const url = process.argv[2] ?? "http://localhost:3100/";
mkdirSync("qa/out", { recursive: true });
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); console.log(c ? "ok  " : "FAIL", m); };

const cases = [
  ["chromium", chromium, 390, 844], ["webkit", webkit, 390, 844],
  ["chromium", chromium, 1440, 800], ["webkit", webkit, 1440, 800],
  ["chromium", chromium, 1366, 657],
];

for (const [name, type, w, h] of cases) {
  const b = await type.launch();
  for (const rm of ["no-preference", "reduce"]) {
    const tag = `${name} ${w}x${h} ${rm}`;
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: rm, hasTouch: w < 900, isMobile: w < 900 && name === "chromium" });
    const p = await ctx.newPage();
    const errs = [];
    p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
    p.on("pageerror", (e) => errs.push(String(e)));
    await p.goto(url, { waitUntil: "load" });
    await p.waitForTimeout(2500);
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `${tag}: sem overflow`);
    ok((await p.locator(".pin-spacer").count()) === 0, `${tag}: sem pin-spacer (CP1 não pina)`);
    if (rm === "reduce") {
      const hidden = await p.evaluate(() => [...document.querySelectorAll("main *")].filter((e) => {
        const s = getComputedStyle(e); return s.opacity === "0" && !e.matches(".lp-veil,.lp-shine,.lp-glow,.lp-count,.lp-n__r,.lp-prob__img--bw,.lp-scene,.lp-sticky,.lp-acao__lights i,.mp-fx,.lp-q .lp-a>div") && !e.closest(".lp-scene,.lp-acao__lights,.lp-sticky,.mp-fx");
      }).length);
      ok(hidden === 0, `${tag}: reduced-motion sem elemento oculto (${hidden})`);
    } else {
      // H1 em linhas + tem cena viva
      ok((await p.locator(".lp-h1 .ln__i-mask").count()) >= 2, `${tag}: h1 dividido em linhas`);
      const lines = await p.evaluate(() => [...document.querySelectorAll(".lp-h1 .ln__i")].map((e) => e.textContent.trim()));
      console.log("     linhas:", JSON.stringify(lines));
      // header
      ok(await p.locator(".lp-header.is-top").count() === 1, `${tag}: header em degradê no topo`);
      await p.mouse.wheel(0, w < 900 ? 1400 : 600); await p.waitForTimeout(700);
      ok(await p.locator(".lp-header.is-solid").count() === 1, `${tag}: header sólido ao rolar`);
      // progresso
      const sx = await p.locator(".lp-progress i").evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).a);
      ok(sx > 0, `${tag}: barra de progresso anda (${sx.toFixed(2)})`);
    }
    // sticky (só mobile), com e sem reduced-motion
    if (w < 900) {
      await p.evaluate(() => scrollTo(0, 1400)); await p.waitForTimeout(700);
      ok(await p.locator(".lp-sticky.is-on").count() === 1 && (await p.locator(".lp-sticky").evaluate((e) => !e.inert)), `${tag}: sticky aparece (sem inert)`);
      await p.locator("#conversar").scrollIntoViewIfNeeded(); await p.waitForTimeout(700);
      ok(await p.locator(".lp-sticky.is-on").count() === 0 && (await p.locator(".lp-sticky").evaluate((e) => e.inert)), `${tag}: sticky some no formulário (inert)`);
      if (rm === "reduce") ok((await p.locator(".lp-sticky").evaluate((e) => getComputedStyle(e).transitionProperty === "none" || parseFloat(getComputedStyle(e).transitionDuration) < 0.001)), `${tag}: sticky sem transição`);
    }
    // FAQ por teclado
    await p.locator("#faq").scrollIntoViewIfNeeded(); await p.waitForTimeout(1200);
    const btn = p.locator(".lp-q button").first();
    await btn.focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(500);
    ok((await btn.getAttribute("aria-expanded")) === "true", `${tag}: FAQ abre com Enter`);
    await p.keyboard.press("Space"); await p.waitForTimeout(500);
    ok((await btn.getAttribute("aria-expanded")) === "false", `${tag}: FAQ fecha com Espaço`);
    await p.keyboard.press("Tab");
    ok(await p.evaluate(() => document.activeElement?.closest(".lp-q") === document.querySelectorAll(".lp-q")[1]), `${tag}: Tab vai ao 2º item`);
    ok(errs.length === 0, `${tag}: 0 erros de console ${errs.length ? JSON.stringify(errs.slice(0, 2)) : ""}`);
    // screenshots
    if (name === "chromium" && !(w === 1366)) {
      await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(2800);
      await p.screenshot({ path: `qa/out/${w}-${rm}-hero.png` });
      for (const id of ["diferenca", "destrava", "quem", "para-quem", "faq"]) {
        await p.locator(`#${id}`).scrollIntoViewIfNeeded(); await p.waitForTimeout(1600);
        await p.screenshot({ path: `qa/out/${w}-${rm}-${id}.png` });
      }
    }
    // resize 1440 -> 390 sem órfãos
    if (w === 1440 && rm === "no-preference") {
      await p.evaluate(() => scrollTo(0, 0));
      await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(1500);
      const o = await p.evaluate(() => ({ sp: document.querySelectorAll(".pin-spacer").length, lines: document.querySelectorAll(".lp-h1 .ln__i-mask").length, nest: document.querySelectorAll(".lp-h1 .ln__i-mask .ln__i-mask").length }));
      ok(o.sp === 0 && o.nest === 0 && o.lines >= 2, `${tag}: resize →390 sem órfãos ${JSON.stringify(o)}`);
    }
    await ctx.close();
  }
  await b.close();
}
console.log(fails.length ? `\n${fails.length} FALHAS` : "\nTUDO OK");
process.exit(fails.length ? 1 : 0);
