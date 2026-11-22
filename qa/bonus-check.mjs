// Bônus: tilt+brilho só com ponteiro fino. Uso: node qa/bonus-check.mjs [url]; shots em qa/shots/f10/
import { chromium } from "@playwright/test";
const url = process.argv[2] ?? "http://localhost:3000/mentoria";
const b = await chromium.launch(); let falhas = 0;
for (const [nome, w, h, touch, rm] of [["1440", 1440, 900, false, "no-preference"], ["1280", 1280, 680, false, "no-preference"], ["390", 390, 844, true, "no-preference"], ["reduce", 1440, 900, false, "reduce"]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, reducedMotion: rm }), p = await ctx.newPage();
  await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(1500);
  const inv = p.locator(".nm-invite"); await inv.scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
  await inv.screenshot({ path: `qa/shots/f10/bonus-${nome}-antes.png` });
  const bx = await inv.boundingBox();
  if (!touch) { await p.mouse.move(bx.x + bx.width * .85, bx.y + bx.height * .2, { steps: 8 }); await p.waitForTimeout(900); }
  const tr = await p.evaluate(() => [getComputedStyle(document.querySelector(".nm-invite__face")).transform, getComputedStyle(document.querySelector(".nm-invite__sheen")).transform]);
  await inv.screenshot({ path: `qa/shots/f10/bonus-${nome}-depois.png` });
  const deve = !touch && rm !== "reduce", tem = tr[0] !== "none" && tr[1] !== "none";
  const ok = deve === tem; if (!ok) falhas++;
  console.log(ok ? "ok  " : "FAIL", nome, "deve inclinar:", deve, tem ? "inclinou" : "estático");
  if (!touch) { await p.mouse.move(5, 5); await p.waitForTimeout(900); const r = await p.evaluate(() => getComputedStyle(document.querySelector(".nm-invite__face")).transform); if (deve) console.log("   solta:", r); }
  await ctx.close();
}
await b.close(); process.exit(falhas ? 1 : 0);
