// QA da F2: protótipo x porte, lado a lado, por seção (chromium, reducedMotion).
// Uso: PROTO=<url file://.../landing/landing-v6.html> PORT=http://localhost:3100 node qa/compare.mjs [390|1440] [label-prefix]
// Precisa de rede (protótipo carrega fontes e GSAP por CDN). Saída em qa/shots/ (gitignored).
import { chromium } from "@playwright/test";
import fs from "node:fs";

const PROTO = process.env.PROTO;
const PORT = process.env.PORT ?? "http://localhost:3100";
const widths = process.argv[2] ? [Number(process.argv[2])] : [390, 1440];
const only = process.argv[3];
const H = { 390: 844, 1440: 900 };

async function prepare(page, url) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  // dispara lazy-load percorrendo a página
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2200); // véu/transições
}

const browser = await chromium.launch();
fs.mkdirSync("qa/shots", { recursive: true });
const report = {};
for (const w of widths) {
  const dir = `qa/shots/${w}`;
  fs.mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: w, height: H[w] }, reducedMotion: "reduce" });
  const [a, b] = [await ctx.newPage(), await ctx.newPage()];
  await prepare(a, PROTO);
  await prepare(b, PORT);
  report[w] = { protoJs: await a.evaluate(() => document.documentElement.classList.contains("mp-js")),
    protoVeil: await a.evaluate(() => { const v = document.querySelector(".lp-veil"); const s = getComputedStyle(v); return { display: s.display, opacity: s.opacity }; }),
    portVeil: await b.evaluate(() => { const s = getComputedStyle(document.querySelector(".lp-veil")); return { display: s.display, opacity: s.opacity }; }) };
  const labels = await b.$$eval("[data-screen-label]", (els) => els.map((e) => e.getAttribute("data-screen-label")));
  for (const label of labels) {
    if (only && !label.startsWith(only)) continue;
    const slug = label.replace(/\W+/g, "-");
    for (const [p, tag] of [[a, "proto"], [b, "port"]]) {
      const el = p.locator(`[data-screen-label="${label}"]`).first();
      if (await el.count()) await el.screenshot({ path: `${dir}/${slug}-${tag}.png`, animations: "disabled" }).catch((e) => console.log("falhou", w, label, tag, e.message.split("\n")[0]));
    }
  }
  // header (viewport topo) e rodapé
  for (const [p, tag] of [[a, "proto"], [b, "port"]]) {
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.screenshot({ path: `${dir}/00-header-${tag}.png`, clip: { x: 0, y: 0, width: w, height: 90 } });
    await p.locator("footer").screenshot({ path: `${dir}/11-footer-${tag}.png` });
  }
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(report, null, 1));
