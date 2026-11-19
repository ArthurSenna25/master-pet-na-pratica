// Relogio do "Um dia na bancada": uma linha, sem sobrepor texto/retrato, sem overflow, caixa de tamanho constante (CLS 0).
// Uso: node qa/relogio-check.mjs [url] [sufixo]. Servidor em pe (build + start, MENTORIA_FORM_ATIVO=1). Capturas em qa/shots/f10/relogio/.
import { chromium, webkit } from "@playwright/test";
import { mkdirSync } from "node:fs";

const url = process.argv[2] ?? "http://localhost:3000/mentoria";
const TAG = process.argv[3] ?? "depois";
const OUT = "qa/shots/f10/relogio";
mkdirSync(OUT, { recursive: true });
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); console.log(c ? "ok  " : "FAIL", m); };
// [rotulo, w, h]; 125% = viewport CSS / 1,25. 390 nao tem pin (relogio inexistente): so confere display:none e sem overflow.
const CASOS = [["1366x768@100", 1366, 768], ["1366x768@125", 1093, 614], ["1440x900@100", 1440, 900], ["1440x900@125", 1152, 720], ["1920x1080@100", 1920, 1080], ["1920x1080@125", 1536, 864], ["390x844", 390, 844]];
const HORAS = [[8, 0.02], [13, 0.48], [18, 0.95]]; // hora, fracao aproximada do percurso (confirmada pelo texto do relogio)

const ir = async (p, y) => { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(900); };
const medir = (p) => p.evaluate(() => {
  const c = document.querySelector(".nm-clock"), b = c.querySelector("b"), s = c.querySelector("span");
  const r = c.getBoundingClientRect(), rb = b.getBoundingClientRect(), rs = s.getBoundingClientRect();
    const inter = (a, o) => Math.max(0, Math.min(a.right, o.right) - Math.max(a.left, o.left)) * Math.max(0, Math.min(a.bottom, o.bottom) - Math.max(a.top, o.top));
  const ocupa = [".nm-dia__head", ".nm-beat"].flatMap((q) => [...document.querySelectorAll(q)]).filter((e) => +getComputedStyle(e).opacity > 0.05).map((e) => inter(r, e.getBoundingClientRect()));
  const face = document.querySelector(".nm-dia__face img");
  return {
    hora: b.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height), umaLinha: Math.abs((rb.top + rb.bottom) / 2 - (rs.top + rs.bottom) / 2) < rb.height * 0.3 && rs.left >= rb.right - 1,
    dentro: rb.left >= r.left - 1 && rs.right <= r.right + 1 && r.left >= -1 && r.right <= innerWidth + 1,
    sobreTexto: ocupa.some((v) => v > 4), sobreRetrato: face ? Math.round(inter(r, face.getBoundingClientRect()) / (r.width * r.height) * 100) : 0,
    fs: Math.round(parseFloat(getComputedStyle(b).fontSize)), usado: Math.round(rs.right - rb.left), over: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  };
});

for (const [nome, tipo] of [["chromium", chromium], ["webkit", webkit]]) {
  const b = await tipo.launch();
  for (const [rot, w, h] of CASOS) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 900 });
    const p = await ctx.newPage(); const tag = `${nome} ${rot}`;
    await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(1500);
    if (w < 900) {
      const r = await p.evaluate(() => ({ d: getComputedStyle(document.querySelector(".nm-clock")).display, over: document.documentElement.scrollWidth > document.documentElement.clientWidth }));
      ok(r.d === "none" && !r.over, `${tag}: sem relogio (cards) e sem overflow (${JSON.stringify(r)})`);
      await ctx.close(); continue;
    }
    if (await p.evaluate(() => getComputedStyle(document.querySelector(".nm-clock")).display === "none")) { ok(true, `${tag}: sem pin (cards), relogio nao existe`); await ctx.close(); continue; }
    const top = await p.evaluate(() => { const e = document.querySelector(".nm-dia"); return Math.round(e.getBoundingClientRect().top + scrollY); });
    const run = await p.evaluate(() => document.querySelector(".nm-dia").offsetHeight - innerHeight);
    const caixas = [];
    for (const [hora, f] of HORAS) {
      let achou = null;
      for (let k = 0; k <= 12 && !achou; k++) { // varre ate o texto do relogio ser a hora pedida
        await ir(p, top + run * Math.min(1, f + (hora === 8 ? 0 : (k - 3) * 0.01)));
        const m = await medir(p); if (+m.hora === hora) achou = m;
      }
      if (!achou) { ok(false, `${tag}: nao consegui parar o relogio em ${hora}h`); continue; }
      caixas.push(`${achou.w}x${achou.h}`);
      ok(achou.umaLinha && achou.dentro && !achou.sobreTexto && !achou.over, `${tag} ${hora}h: uma linha, dentro da coluna, sem sobrepor texto, sem overflow (${JSON.stringify(achou)})`);
      await p.screenshot({ path: `${OUT}/${TAG}-${nome}-${rot}-${String(hora).padStart(2, "0")}h.png` });
    }
    ok(new Set(caixas).size <= 1, `${tag}: caixa do relogio constante entre 8h/13h/18h (${caixas.join(" | ")})`);
    await ctx.close();
  }
  await b.close();
}
console.log(fails.length ? `\n${fails.length} FALHA(S)` : "\ntudo ok");
process.exit(fails.length ? 1 : 0);
