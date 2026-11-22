// Botão magnético: desloca ≤12% do raio perto do cursor, volta ao sair, nada sem ponteiro fino/reduced-motion. Uso: node qa/magnetico-check.mjs [url]
import { chromium } from "@playwright/test";
const url = process.argv[2] ?? "http://localhost:3000/mentoria";
const b = await chromium.launch(); let falhas = 0;
const desloc = (p) => p.evaluate(() => { const m = new DOMMatrixReadOnly(getComputedStyle(document.querySelector("[data-nm-magnet]")).transform); return [m.m41, m.m42]; });
for (const [nome, w, h, touch, rm] of [["1440", 1440, 900, false, "no-preference"], ["1280", 1280, 680, false, "no-preference"], ["390", 390, 844, true, "no-preference"], ["reduce", 1440, 900, false, "reduce"]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, reducedMotion: rm }), p = await ctx.newPage();
  await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(1500);
  const btn = p.locator(".nm-hero [data-nm-magnet]").first();
  const bx = await btn.boundingBox(), R = Math.max(bx.width, bx.height) / 2;
  await p.screenshot({ path: `qa/shots/f10/magnet-${nome}-antes.png` });
  if (!touch) { await p.mouse.move(bx.x + bx.width * .95, bx.y + bx.height * .9, { steps: 10 }); await p.waitForTimeout(1000); }
  const [dx, dy] = await desloc(p);
  await p.screenshot({ path: `qa/shots/f10/magnet-${nome}-depois.png` });
  const deve = !touch && rm !== "reduce", mov = Math.hypot(dx, dy) > 0.1, max = 0.12 * R + 0.01;
  let ok = deve === mov && Math.abs(dx) <= max && Math.abs(dy) <= max;
  if (deve) { await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height + 200, { steps: 6 }); await p.waitForTimeout(1000); const [ex, ey] = await desloc(p); ok &&= Math.hypot(ex, ey) < 0.1; }
  if (!ok) falhas++;
  console.log(ok ? "ok  " : "FAIL", nome, `desloc=(${dx.toFixed(2)},${dy.toFixed(2)}) max=${max.toFixed(2)} esperado mover=${deve}`);
  await ctx.close();
}
await b.close(); process.exit(falhas ? 1 : 0);
