// CLS e LCP com rolagem REAL (page.mouse.wheel) na mentoria e na landing. Uso: node qa/cls-wheel.mjs [base=http://localhost:3000] [rodadas=2]
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3000";
const RODADAS = Number(process.argv[3] ?? 2);
const VIEWS = [["1366x768@100", 1366, 768], ["1366x768@125", 1093, 614], ["1440x900@100", 1440, 900], ["1440x900@125", 1152, 720]];
let falhas = 0;
const b = await chromium.launch();
for (const rota of process.argv[4] ? [process.argv[4]] : ["/mentoria", "/"]) { // 4º arg opcional: só uma rota
  for (const [rot, w, h] of VIEWS) {
    for (let i = 1; i <= RODADAS; i++) {
      const ctx = await b.newContext({ viewport: { width: w, height: h } }), p = await ctx.newPage();
      await p.addInitScript(() => {
        window.__v = { lcp: 0, cls: 0, fontes: [] };
        new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__v.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) { window.__v.cls += e.value; window.__v.fontes.push(e.sources.map((s) => s.node?.className || s.node?.nodeName).join("|")); } }).observe({ type: "layout-shift", buffered: true });
      });
      await p.goto(base + rota, { waitUntil: "load" }); await p.waitForTimeout(2500);
      const carga = await p.evaluate(() => window.__v.cls);
      await p.mouse.move(w / 2, h / 2);
      let ultimo = -1;
      for (let n = 0; n < 200; n++) { // desce com a roda (passo de 300 px) ate o fim da pagina
        await p.mouse.wheel(0, 300); await p.waitForTimeout(60);
        const y = await p.evaluate(() => Math.round(scrollY)); if (y === ultimo && n > 3) break; ultimo = y;
      }
      await p.waitForTimeout(1200);
      for (let n = 0; n < 200; n++) { await p.mouse.wheel(0, -600); await p.waitForTimeout(40); if (await p.evaluate(() => scrollY) === 0) break; } // e volta ao topo
      await p.waitForTimeout(800);
      const v = await p.evaluate(() => window.__v);
      const ok = v.cls === 0 && v.lcp <= 2500;
      if (!ok) falhas++;
      console.log(`${ok ? "ok  " : "FAIL"} ${rota} ${rot} #${i}: CLS carga=${carga.toFixed(4)} CLS total (carga+roda ate o fim e volta)=${v.cls.toFixed(4)} LCP=${Math.round(v.lcp)}ms ${v.cls ? v.fontes.join(" ; ") : ""}`);
      await ctx.close();
    }
  }
}
await b.close();
console.log(falhas ? `\n${falhas} FALHA(S)` : "\ntudo ok");
process.exit(falhas ? 1 : 0);
