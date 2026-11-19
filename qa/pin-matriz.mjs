// Matriz de viewports do pin (Dia + Trilha): liga? cabe sem corte? sem vao? sem overflow? sem sobrepor o cabecalho fixo?
// Uso: node qa/pin-matriz.mjs [url] [chromium|webkit|ambos] [filtro-regex-opcional]. Servidor em pe (build + start, MENTORIA_FORM_ATIVO=1).
// 125% = viewport CSS / 1,25. Saida: uma linha por viewport + tabela final; exit 1 se algum viewport falhar.
import { chromium, webkit } from "@playwright/test";

const url = process.argv[2] ?? "http://localhost:3000/mentoria";
const qual = process.argv[3] ?? "chromium";
const filtro = new RegExp(process.argv[4] ?? ".");
const BASE = [[1280, 600], [1366, 657], [1366, 768], [1440, 700], [1440, 780], [1440, 900], [1512, 860], [1536, 730], [1920, 1080], [1024, 768], [390, 844]];
const EXTRA = (process.env.EXTRA ?? "").split(",").filter(Boolean).map((x) => x.split("x").map(Number)); // ex.: EXTRA=900x600,1152x575 (so @100)
const CASOS = (process.env.EXTRA_ONLY ? EXTRA.map(([w, h]) => [`${w}x${h}@100`, w, h]) : BASE.flatMap(([w, h]) => [[`${w}x${h}@100`, w, h], [`${w}x${h}@125`, Math.round(w / 1.25), Math.round(h / 1.25)]])).filter(([r]) => filtro.test(r));
const FX = 0.14, FY = 0.12, MARGEM = 8; // mesmas fracoes do mask da fita (ver fita-check)
const sleep = (p, ms) => p.waitForTimeout(ms);

// ---- roda no navegador ----
const medirDia = () => {
  const hdr = parseFloat(getComputedStyle(document.querySelector(".nm")).getPropertyValue("--nm-hdr")) || 68, vh = innerHeight, erros = [];
  const vis = (e) => +getComputedStyle(e).opacity > 0.5 && getComputedStyle(e).visibility !== "hidden";
  const R = (e) => e.getBoundingClientRect();
  const diagVis = +getComputedStyle(document.querySelector(".nm-diag")).opacity > 0.5;
  const alvos = diagVis
    ? [[".nm-diag__q", document.querySelector(".nm-diag__q")], [".nm-diag__r", document.querySelector(".nm-diag__r")]]
    : [[".nm-dia__head", document.querySelector(".nm-dia__head")], [".nm-clock", document.querySelector(".nm-clock")], ...[...document.querySelectorAll(".nm-beat")].filter(vis).map((e) => [".nm-beat", e])];
  const rects = alvos.map(([q, e]) => [q, R(e)]);
  for (const [q, r] of rects) {
    if (r.top < hdr - 1) erros.push(`${q} sob o cabecalho (${Math.round(r.top)}<${hdr})`);
    if (r.bottom > vh + 1) erros.push(`${q} cortado embaixo (${Math.round(r.bottom)}>${vh})`);
    if (r.right > innerWidth + 1 || r.left < -1) erros.push(`${q} fora na horizontal`);
  }
  if (!diagVis) {
    const c = R(document.querySelector(".nm-clock"));
    for (const [q, o] of rects) if (q !== ".nm-clock" && Math.min(c.right, o.right) - Math.max(c.left, o.left) > 2 && Math.min(c.bottom, o.bottom) - Math.max(c.top, o.top) > 2) erros.push("relogio sobrepoe texto");
  }
  const pin = document.querySelector(".nm-dia__pin");
  if (pin.scrollHeight > pin.clientHeight + 1) erros.push(`pin com conteudo maior (${pin.scrollHeight}>${pin.clientHeight})`);
  const top = Math.min(...rects.map(([, r]) => r.top)), bot = Math.max(...rects.map(([, r]) => r.bottom));
  return { erros, ocupa: +((bot - top) / (vh - hdr)).toFixed(2) };
};
const medirTrilha = ([k, FX, FY, MARGEM]) => {
  const hdr = parseFloat(getComputedStyle(document.querySelector(".nm")).getPropertyValue("--nm-hdr")) || 68, vh = innerHeight, erros = [], R = (e) => e.getBoundingClientRect();
  const head = R(document.querySelector(".nm-trilha__head")), foot = R(document.querySelector(".nm-trilha__foot")), card = R(document.querySelector(`.nm-st[data-st="${k}"]`)), rib = document.querySelector(".nm-ribbon");
  if (head.top < hdr - 1) erros.push(`titulo sob o cabecalho (${Math.round(head.top)}<${hdr})`);
  if (foot.bottom > vh + 1) erros.push(`rodape cortado (${Math.round(foot.bottom)}>${vh})`);
  if (card.top < head.bottom - 2) erros.push(`cartao ${k} sobre o titulo (${Math.round(card.top)}<${Math.round(head.bottom)})`);
  if (card.bottom > foot.top + 2) erros.push(`cartao ${k} sobre o rodape (${Math.round(card.bottom)}>${Math.round(foot.top)})`);
  const pin = document.querySelector(".nm-trilha__pin");
  if (pin.scrollHeight > pin.clientHeight + 1) erros.push(`pin com conteudo maior (${pin.scrollHeight}>${pin.clientHeight})`);
  const box = R(rib), L = box.left + box.width * FX + MARGEM, Rr = box.right - box.width * FX - MARGEM, T = box.top + box.height * FY + MARGEM, B = box.bottom - box.height * FY - MARGEM;
  const g = [...rib.querySelector(".nm-rib__cam").children].filter((e) => e.tagName === "g" && e.querySelector("text"))[k - 1];
  const rs = [[...g.querySelectorAll("circle")].find((c) => c.getAttribute("r") === "30"), g.querySelectorAll("text")[1]].map((e) => R(e));
  const sobra = Math.round(Math.min(...rs.map((r) => Math.min(r.left - L, Rr - r.right, r.top - T, B - r.bottom))));
  if (sobra < 0) erros.push(`no/rotulo da fita fora da faixa solida (${sobra}px)`);
  if (box.top < hdr - 1 || box.bottom > vh + 1) erros.push("fita fora da tela");
  return { erros, ocupa: +((foot.bottom - head.top) / (vh - hdr)).toFixed(2) };
};
const vaos = () => {
  const out = [];
  for (const q of [".nm-dia", ".nm-trilha"]) {
    const e = document.querySelector(q), r = e.getBoundingClientRect(), n = e.nextElementSibling, pv = e.previousElementSibling;
    if (Math.abs(n.getBoundingClientRect().top - r.bottom) > 1) out.push(`vao depois de ${q}`);
    if (Math.abs(pv.getBoundingClientRect().bottom - r.top) > 1) out.push(`vao antes de ${q}`);
  }
  return out;
};
// ---- fim ----

const tabela = [];
for (const [nome, tipo] of [["chromium", chromium], ["webkit", webkit]].filter(([n]) => qual === "ambos" || qual === n)) {
  const b = await tipo.launch();
  for (const [rot, w, h] of CASOS) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 900 }), p = await ctx.newPage();
    await p.goto(url, { waitUntil: "load" }); await sleep(p, 2000);
    const st = await p.evaluate(() => ({ dia: document.querySelector(".nm-dia").classList.contains("is-pinned"), tri: document.querySelector(".nm-trilha").classList.contains("is-pinned"), over: document.documentElement.scrollWidth > document.documentElement.clientWidth }));
    const erros = [], ocupa = [];
    if (st.over) erros.push("overflow horizontal");
    if (st.dia !== st.tri) erros.push("Dia e Trilha discordam do pin");
    if (st.dia && st.tri) {
      erros.push(...await p.evaluate(vaos));
      const t0 = await p.evaluate(() => { const e = document.querySelector(".nm-dia"); return [Math.round(e.getBoundingClientRect().top + scrollY), e.offsetHeight - innerHeight]; });
      for (const f of [0.02, 0.5, 0.99]) {
        await p.evaluate((y) => scrollTo(0, y), t0[0] + t0[1] * f); await sleep(p, 1000);
        const r = await p.evaluate(medirDia); erros.push(...r.erros.map((x) => `Dia@${f}: ${x}`)); ocupa.push(`D${r.ocupa}`);
      }
      const t3 = await p.evaluate(() => Math.round(document.querySelector(".nm-trilha").getBoundingClientRect().top + scrollY));
      await p.evaluate((y) => scrollTo(0, y), t3); await sleep(p, 1200);
      for (const k of [1, 3, 6]) {
        if (k > 1) { await p.locator(`[data-st-go="${k}"]`).click(); await sleep(p, 2800); }
        const r = await p.evaluate(medirTrilha, [k, FX, FY, MARGEM]); erros.push(...r.erros.map((x) => `Trilha est${k}: ${x}`)); ocupa.push(`T${r.ocupa}`);
      }
    }
    const pinned = st.dia && st.tri;
    tabela.push({ nome, rot, pinned, ok: erros.length === 0, erros });
    console.log(`${erros.length ? "FAIL" : "ok  "} ${nome} ${rot} (${w}x${h}) ${pinned ? "PIN" : "cards"} ${ocupa.join(" ")} ${[...new Set(erros)].slice(0, 4).join(" | ")}`);
    await ctx.close();
  }
  await b.close();
}
console.log("\nviewport | pin | resultado");
for (const t of tabela) console.log(`${t.nome} ${t.rot} | ${t.pinned ? "liga" : "cards"} | ${t.ok ? "ok" : "FALHA: " + [...new Set(t.erros)].slice(0, 2).join("; ")}`);
const ruins = tabela.filter((t) => !t.ok).length;
console.log(ruins ? `\n${ruins} viewport(s) com falha` : "\ntudo ok");
process.exit(ruins ? 1 : 0);
