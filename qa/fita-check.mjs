// Fita da trilha: a coluna do SVG esmaece nas bordas (sem corte em linha reta) e a estacao em foco, com o rotulo, fica inteira na faixa sem esmaecimento.
// Uso: node qa/fita-check.mjs [url] [sufixo-das-capturas]. Capturas em qa/shots/f10/fita/. 125% = viewport CSS dividido por 1,25 (como em trilha-check).
import { chromium, webkit } from "@playwright/test";
import { mkdirSync } from "node:fs";

const url = process.argv[2] ?? "http://localhost:3000/mentoria";
const TAG = process.argv[3] ?? "depois";
const OUT = "qa/shots/f10/fita";
const FX = 0.14, FY = 0.12, MARGEM = 8; // mesmas fracoes do CSS (--nm-fade-x/y); folga extra em px
mkdirSync(OUT, { recursive: true });
const CASOS = [["1366x768@100", 1366, 768], ["1366x768@125", 1093, 614], ["1440x900@100", 1440, 900], ["1440x900@125", 1152, 720], ["1920x1080@100", 1920, 1080], ["1920x1080@125", 1536, 864]];
let falhas = 0;

// k = estacao em foco (1..6): no (circulo r=30) e rotulo dentro da faixa sem esmaecimento
const medir = ([k, FX, FY, MARGEM]) => {
  const svg = document.querySelector(".nm-ribbon"), box = svg.getBoundingClientRect(), cs = getComputedStyle(svg);
  const mask = cs.maskImage !== "none" || cs.webkitMaskImage !== "none";
  const L = box.left + box.width * FX + MARGEM, Rr = box.right - box.width * FX - MARGEM, T = box.top + box.height * FY + MARGEM, B = box.bottom - box.height * FY - MARGEM;
  const g = [...svg.querySelector(".nm-rib__cam").children].filter((e) => e.tagName === "g" && e.querySelector("text"))[k - 1];
  const rs = [[...g.querySelectorAll("circle")].find((c) => c.getAttribute("r") === "30"), g.querySelectorAll("text")[1]].map((e) => e.getBoundingClientRect());
  const sobra = Math.round(Math.min(...rs.map((r) => Math.min(r.left - L, Rr - r.right, r.top - T, B - r.bottom)))); // >= 0: dentro da faixa sem esmaecimento
  return { mask, sobra, col: [Math.round(box.width), Math.round(box.height)] };
};

for (const [nome, tipo] of [["chromium", chromium], ["webkit", webkit]]) {
  const b = await tipo.launch();
  for (const [rot, w, h] of CASOS) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } }), p = await ctx.newPage();
    await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(2000);
    if (!(await p.evaluate(() => document.querySelector(".nm-trilha").classList.contains("is-pinned")))) { console.log(`skip ${nome} ${rot}: sem pin (a fita nem e desenhada)`); await ctx.close(); continue; }
    const top = await p.evaluate(() => { const s = document.querySelector(".nm-trilha"), sp = s.parentElement.classList.contains("pin-spacer") ? s.parentElement : s; return Math.round(sp.getBoundingClientRect().top + scrollY); });
    await p.evaluate((y) => scrollTo(0, y), top); await p.waitForTimeout(1200);
    for (let k = 1; k <= 6; k++) {
      if (k > 1) { await p.locator(`[data-st-go="${k}"]`).click(); await p.waitForTimeout(2800); }
      const r = await p.evaluate(medir, [k, FX, FY, MARGEM]), ok = r.mask && r.sobra >= 0;
      if (!ok) falhas++;
      console.log(`${ok ? "ok  " : "FAIL"} ${nome} ${rot} est${k} col=${r.col.join("x")} mascara=${r.mask} folga-na-faixa-solida=${r.sobra}px`);
      if (nome === "chromium") await p.locator(".nm-ribbon").screenshot({ path: `${OUT}/${TAG}-${rot}-est${k}.png` });
    }
    await ctx.close();
  }
  await b.close();
}
console.log(falhas ? `\n${falhas} FALHA(S)` : "\ntudo ok");
process.exit(falhas ? 1 : 0);
