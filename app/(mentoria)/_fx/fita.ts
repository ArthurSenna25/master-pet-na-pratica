import { clamp, lerp } from "./util";

// Fita dourada em perspectiva da trilha (cena 3 do handoff v4, mentoria.js buildRibbon). SVG gerado aqui, em runtime: sem JS a trilha é só a grade de cartões.
const NS = "http://www.w3.org/2000/svg";
type Attrs = Record<string, string | number>;
type P3 = [number, number, number];
type Par = [number, number];

function el<K extends keyof SVGElementTagNameMap>(nome: K, attrs: Attrs, pai?: Element): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, nome);
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  pai?.appendChild(e);
  return e;
}

const ROTULOS = ["Raio-X", "Gargalos", "Equipe", "Preço", "Padrões", "Rotina"];
const ESTACOES: P3[] = [[520, 170, 0.9], [300, 300, 0.72], [560, 440, 0.54], [260, 590, 0.38], [540, 740, 0.22], [400, 900, 0.06]];
const PONTOS: P3[] = [[720, 30, 1.05], ...ESTACOES, [390, 1050, 0]];
const escala = (d: number) => 1 / (1 + 2.2 * d);

// Catmull-Rom entre pontos de controle (x, y, profundidade).
function cr(p0: P3, p1: P3, p2: P3, p3: P3, t: number): P3 {
  const t2 = t * t, t3 = t2 * t;
  const f = (k: 0 | 1 | 2) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
  return [f(0), f(1), f(2)];
}

const poly = (A: Par[], B: Par[], dx = 0, dy = 0) =>
  "M" + A.map((q) => `${(q[0] + dx).toFixed(1)} ${(q[1] + dy).toFixed(1)}`).join("L") + "L" +
  B.slice().reverse().map((q) => `${(q[0] + dx).toFixed(1)} ${(q[1] + dy).toFixed(1)}`).join("L") + "Z";

export interface Fita { render: (t: number) => void; setHit: (n: number) => void }

export function construirFita(svg: SVGSVGElement): Fita {
  svg.replaceChildren();
  const S: P3[] = [];
  const N = 22;
  for (let seg = 0; seg < PONTOS.length - 1; seg++) {
    for (let i = 0; i < N; i++) S.push(cr(PONTOS[Math.max(0, seg - 1)], PONTOS[seg], PONTOS[seg + 1], PONTOS[Math.min(PONTOS.length - 1, seg + 2)], i / N));
  }
  S.push(PONTOS[PONTOS.length - 1]);
  const L: Par[] = [], R: Par[] = [], H1: Par[] = [], H2: Par[] = [], C: Par[] = [];
  S.forEach((p, i) => {
    const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)];
    const tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1, nx = -ty / l, ny = tx / l;
    const w = 68 * escala(p[2]) * (0.22 + 0.78 * Math.abs(Math.cos(i * 0.33)));
    const off = w * 0.2 * Math.sign(Math.sin(i * 0.33)), hw = w * 0.22;
    L.push([p[0] + (nx * w) / 2, p[1] + (ny * w) / 2]); R.push([p[0] - (nx * w) / 2, p[1] - (ny * w) / 2]);
    H1.push([p[0] + nx * (off + hw), p[1] + ny * (off + hw)]); H2.push([p[0] + nx * (off - hw), p[1] + ny * (off - hw)]);
    C.push([p[0], p[1]]);
  });
  const linha = "M" + C.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join("L");

  const defs = el("defs", {}, svg);
  const gr = el("linearGradient", { id: "nm-rg", gradientUnits: "userSpaceOnUse", x1: 0, y1: 0, x2: 800, y2: 1000 }, defs);
  ([["0", "#8a6a1e"], [".35", "#cdaa55"], [".55", "#f0dca0"], [".8", "#b8913a"], ["1", "#9f7b2a"]] as const).forEach(([o, c]) => el("stop", { offset: o, "stop-color": c }, gr));
  const mk = el("mask", { id: "nm-rm", maskUnits: "userSpaceOnUse", x: -400, y: -400, width: 1600, height: 1800 }, defs);
  const mp = el("path", { d: linha, fill: "none", stroke: "#fff", "stroke-width": 180, "stroke-linecap": "round", "stroke-linejoin": "round" }, mk);
  const cam = el("g", { class: "nm-rib__cam" }, svg), rb = el("g", { mask: "url(#nm-rm)" }, cam);
  el("path", { d: poly(L, R, 10, 16), fill: "rgba(0,0,0,.4)" }, rb);
  el("path", { d: poly(L, R), fill: "url(#nm-rg)" }, rb);
  el("path", { d: poly(H1, H2), fill: "rgba(255,248,222,.6)" }, rb);
  const cl = el("path", { d: linha, fill: "none", stroke: "none" }, cam), total = cl.getTotalLength();
  // fração do comprimento em cada estação (ponto da curva mais próximo)
  const U = ESTACOES.map((s) => {
    let best = 0, bd = 1e9;
    for (let i = 0; i <= 400; i++) { const q = cl.getPointAtLength((total * i) / 400), d = Math.hypot(q.x - s[0], q.y - s[1]); if (d < bd) { bd = d; best = i / 400; } }
    return best;
  });
  mp.style.strokeDasharray = String(total); mp.style.strokeDashoffset = String(total);
  const nos = ESTACOES.map((s, i) => {
    const k = escala(s[2]) * 1.25, g = el("g", { transform: `translate(${s[0]} ${s[1]}) scale(${k.toFixed(3)})` }, cam);
    const halo = el("circle", { r: 54, fill: "rgba(220,197,138,.28)", opacity: 0 }, g);
    const hit = el("circle", { r: 46, fill: "none", stroke: "#f0dca0", "stroke-width": 3, "stroke-dasharray": "6 7", opacity: 0 }, g);
    el("circle", { r: 30, fill: "#0a1633", stroke: "#cdaa55", "stroke-width": 3 }, g);
    el("text", { "text-anchor": "middle", y: 9, fill: "#cdaa55", "font-size": 26 }, g).textContent = String(i + 1);
    el("text", { "text-anchor": "start", x: 44, y: 8, fill: "#f9f5ec", "font-size": 24, stroke: "#0a1633", "stroke-width": 6, "paint-order": "stroke", "stroke-linejoin": "round" }, g).textContent = ROTULOS[i];
    return { g, halo, hit };
  });
  const brilho = el("path", { d: linha, fill: "none", stroke: "rgba(255,250,232,.9)", "stroke-width": 3.5, "stroke-linecap": "round" }, rb);
  brilho.style.strokeDasharray = `110 ${total * 2}`;
  const glow = el("circle", { r: 26, fill: "rgba(240,220,160,.35)" }, cam), orb = el("circle", { r: 10, fill: "#f0dca0" }, cam);
  const camS = ESTACOES.map((s) => 1.05 / Math.pow(escala(s[2]), 0.9));
  let hitN = 0, ultimo = 0;

  function render(t0: number) {
    const t = clamp(t0, 0, 5); ultimo = t;
    const k = Math.min(4, Math.floor(t)), f = t - k;
    const s = lerp(camS[k], camS[k + 1], f), x = lerp(ESTACOES[k][0], ESTACOES[k + 1][0], f), y = lerp(ESTACOES[k][1], ESTACOES[k + 1][1], f), u = lerp(U[k], U[k + 1], f);
    cam.setAttribute("transform", `translate(${(400 - x * s).toFixed(1)} ${(500 - y * s).toFixed(1)}) scale(${s.toFixed(3)})`);
    mp.style.strokeDashoffset = String(total * (1 - clamp(u + 0.004, 0, 1)));
    brilho.style.strokeDashoffset = String(110 - total * u);
    const q = cl.getPointAtLength(total * u);
    for (const o of [orb, glow]) { o.setAttribute("cx", String(q.x)); o.setAttribute("cy", String(q.y)); }
    nos.forEach((n, i) => {
      n.g.setAttribute("opacity", i <= t + 0.5 ? "1" : ".3");
      n.halo.setAttribute("opacity", String(clamp(1 - Math.abs(i - t), 0, 1)));
      n.hit.setAttribute("opacity", hitN === i + 1 ? "1" : "0");
    });
  }
  render(0);
  return { render, setHit: (n) => { hitN = n; render(ultimo); } };
}
