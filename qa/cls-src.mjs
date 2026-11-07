// Fontes de layout-shift. Uso: node qa/cls-src.mjs [url]
import { chromium } from "@playwright/test";
const url = process.argv[2] ?? "http://localhost:3100/";
const b = await chromium.launch();
for (const [w, h] of [[390, 844], [1440, 800]]) {
  for (let i = 0; i < 3; i++) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
    await p.addInitScript(() => {
      window.__s = [];
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__s.push({ v: e.value, t: Math.round(e.startTime), n: e.sources.map((s) => (s.node?.className || s.node?.nodeName) + "") }); }).observe({ type: "layout-shift", buffered: true });
    });
    await p.goto(url, { waitUntil: "load" });
    await p.waitForTimeout(3000);
    const s = await p.evaluate(() => window.__s);
    console.log(w, "cls", s.reduce((a, x) => a + x.v, 0).toFixed(4), JSON.stringify(s));
  }
}
await b.close();
