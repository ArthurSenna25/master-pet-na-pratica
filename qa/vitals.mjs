// LCP/CLS no mobile (390x844, 4x CPU) via PerformanceObserver. Uso: node qa/vitals.mjs [url]
import { chromium, devices } from "@playwright/test";
const url = process.argv[2] ?? "http://localhost:3100/";
const b = await chromium.launch();
const out = [];
for (let i = 0; i < 3; i++) {
  const ctx = await b.newContext({ ...devices["Pixel 7"] });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await p.addInitScript(() => {
    window.__v = { lcp: 0, cls: 0 };
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__v.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__v.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
  });
  await p.goto(url, { waitUntil: "load" });
  await p.waitForTimeout(3500);
  out.push(await p.evaluate(() => window.__v));
  await ctx.close();
}
await b.close();
console.log(url, JSON.stringify(out.map((v) => ({ lcp: Math.round(v.lcp), cls: +v.cls.toFixed(4) }))));
