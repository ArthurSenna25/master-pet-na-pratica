// Faixa de depoimentos: setas, teclado, arraste, contador; sem JS = faixa rolável sem setas. Uso: node qa/depoimentos-check.mjs [url]
import { chromium } from "@playwright/test";
const url = process.argv[2] ?? "http://localhost:3000/mentoria";
const b = await chromium.launch(); let falhas = 0;
const ok = (c, m) => { if (!c) falhas++; console.log(c ? "ok  " : "FAIL", m); };
for (const [nome, w, h, touch, rm, js] of [["1440", 1440, 900, false, "no-preference", true], ["1280", 1280, 680, false, "no-preference", true], ["390", 390, 844, true, "no-preference", true], ["reduce", 1440, 900, false, "reduce", true], ["semjs", 1440, 900, false, "no-preference", false], ["semjs390", 390, 844, true, "no-preference", false]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, reducedMotion: rm, javaScriptEnabled: js }), p = await ctx.newPage();
  await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(1500);
  const car = p.locator(".nm-dep__car"); await car.scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
  const tr = p.locator(".nm-dep__track"), prox = p.locator('[data-nm-dep="1"]'), ct = p.locator("[data-nm-dep-ct]");
  await p.locator("#depoimentos").screenshot({ path: `qa/shots/f10/depo-${nome}.png` });
  if (!js) {
    ok(!(await prox.isVisible()) && !(await ct.isVisible()), `${nome}: sem JS não mostra setas nem contador`);
    ok(await tr.evaluate((e) => e.scrollWidth > e.clientWidth), `${nome}: sem JS a faixa rola`);
    await ctx.close(); continue;
  }
  ok(await prox.isVisible() && await ct.isVisible(), `${nome}: setas e contador visíveis`);
  ok((await ct.textContent()).trim() === "1 / 6" && await p.locator('[data-nm-dep="-1"]').isDisabled(), `${nome}: começa 1 / 6, anterior desabilitado`);
  await prox.click(); await p.waitForTimeout(1000);
  const x1 = await tr.evaluate((e) => e.scrollLeft); ok(x1 > 50, `${nome}: seta próximo rola (${Math.round(x1)}px)`);
  await prox.focus(); await p.keyboard.press("ArrowRight"); await p.waitForTimeout(1000);
  ok(await tr.evaluate((e) => e.scrollLeft) > x1, `${nome}: → com foco nas setas avança`);
  await p.keyboard.press("ArrowLeft"); await p.waitForTimeout(1000);
  ok(await tr.evaluate((e) => e.scrollLeft) <= x1 + 2, `${nome}: ← volta`);
  if (!touch) {
    const x2 = await tr.evaluate((e) => e.scrollLeft), bb = await tr.boundingBox();
    await p.mouse.move(bb.x + bb.width * .7, bb.y + 60); await p.mouse.down(); await p.mouse.move(bb.x + bb.width * .3, bb.y + 60, { steps: 10 }); await p.mouse.up(); await p.waitForTimeout(1000);
    ok(await tr.evaluate((e) => e.scrollLeft) > x2 + 20, `${nome}: arrastar com o mouse rola`);
  }
  for (let i = 0; i < 8; i++) { if (await prox.isDisabled()) break; await prox.click(); await p.waitForTimeout(700); }
  ok((await ct.textContent()).trim() === "6 / 6" && await prox.isDisabled(), `${nome}: fim = 6 / 6, próximo desabilitado`);
  await p.locator(".nm-dep__c--vid [data-nm-vid]").click(); 
  ok((await p.locator(".nm-dep__c--vid [data-nm-vn]").textContent()).includes("nenhum arquivo"), `${nome}: vídeo sem autoplay, aviso ao clicar`);
  ok(await p.evaluate(() => [...document.querySelectorAll("video")].every((v) => v.paused)), `${nome}: nenhum <video> tocando`);
  await ctx.close();
}
await b.close(); process.exit(falhas ? 1 : 0);
