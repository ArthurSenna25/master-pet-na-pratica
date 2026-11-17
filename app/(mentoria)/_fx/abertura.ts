import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Cleanup } from "./util";

/**
 * Cena 1 · Abertura (handoff v4): paralaxe em 3 camadas (fundo de luz, retrato, poeira) com a rolagem + poeira dourada em canvas (único loop, só com o hero na tela).
 * A entrada do título NÃO é daqui: são keyframes de CSS (`nm-in`), então nada acima da dobra é escondido por JS. Reduced-motion: esta função não é chamada.
 */
export function abertura(): Cleanup {
  const hero = document.querySelector<HTMLElement>(".nm-hero");
  if (!hero) return () => {};
  const bg = hero.querySelector<HTMLElement>(".nm-hero__bg");
  const foto = hero.querySelector<HTMLElement>(".nm-hero__photo img");
  const cv = hero.querySelector<HTMLCanvasElement>(".nm-sparkles");

  const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
  if (bg) tl.to(bg, { yPercent: 8, ease: "none" }, 0);
  if (foto) tl.to(foto, { yPercent: -5, ease: "none" }, 0);
  if (cv) tl.to(cv, { yPercent: -14, ease: "none" }, 0);

  const cx = cv?.getContext("2d");
  if (!cv || !cx) return () => { tl.scrollTrigger?.kill(); tl.kill(); gsap.set([bg, foto], { clearProps: "transform" }); };

  interface Particula { x: number; y: number; r: number; v: number; p: number; s: number }
  let w = 0, h = 0, ps: Particula[] = [], ativo = true;
  const medir = () => {
    const d = Math.min(window.devicePixelRatio || 1, 1.5);
    w = cv.clientWidth; h = cv.clientHeight;
    if (!w) return; // canvas escondido (<900px): nada a desenhar
    cv.width = w * d; cv.height = h * d; cx.setTransform(d, 0, 0, d, 0, 0);
    ps = Array.from({ length: w < 700 ? 18 : 44 }, () => ({ x: Math.random() * w, y: Math.random() * h, r: 0.7 + Math.random() * 1.6, v: 4 + Math.random() * 9, p: Math.random() * 6.28, s: 0.5 + Math.random() }));
  };
  const quadro = (t: number, dt: number) => {
    if (!ativo || !w) return;
    cx.clearRect(0, 0, w, h);
    cx.fillStyle = "#dcc58a";
    for (const o of ps) {
      o.y -= (o.v * dt) / 1000;
      if (o.y < -4) { o.y = h + 4; o.x = Math.random() * w; }
      cx.globalAlpha = 0.12 + 0.7 * Math.pow(0.5 + 0.5 * Math.sin(t * o.s + o.p), 2);
      cx.beginPath(); cx.arc(o.x, o.y, o.r, 0, 6.283); cx.fill();
    }
  };
  medir();
  const ro = new ResizeObserver(medir); ro.observe(cv);
  const st = ScrollTrigger.create({ trigger: hero, start: "top bottom", end: "bottom top", onToggle: (s) => { ativo = s.isActive; } });
  gsap.ticker.add(quadro);
  return () => {
    gsap.ticker.remove(quadro); ro.disconnect(); st.kill();
    tl.scrollTrigger?.kill(); tl.kill();
    cx.clearRect(0, 0, cv.width, cv.height);
    gsap.set([bg, foto, cv], { clearProps: "transform" });
  };
}
