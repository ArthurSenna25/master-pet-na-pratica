import gsap from "gsap";
import { PIN, pinEnd, type Cleanup } from "./util";

const R = [0.5, 1.7, 2.9, 4.1, 5.3, 6.5]; // instante em que o traço alcança cada nó
const LOW = "(min-width:900px) and (max-height:719px)";
const MOBILE = "(max-width:899px)";

/** 4 / 4m · Como funciona. Traço por getPointAtLength; pin só em PIN. Estado inicial só aqui (pós-hidratação). */
export function como(): Cleanup {
  const sec = document.querySelector<HTMLElement>("#como");
  const path = sec?.querySelector<SVGPathElement>(".lp-route");
  const cnt = sec?.querySelector<HTMLElement>(".lp-count");
  const cn = sec?.querySelector<HTMLElement>(".lp-count__n");
  const glow = sec?.querySelector<HTMLElement>(".lp-flow__glow");
  if (!sec || !path || !cnt || !cn || !glow) return () => {};
  const q = <T extends Element>(s: string) => [...sec.querySelectorAll<T>(s)];
  const nodes = q<HTMLElement>(".lp-n");
  const gl = q<HTMLElement>(".lp-n__g");
  const rings = q<HTMLElement>(".lp-n__r");
  const steps = q<HTMLElement>(".lp-step2");
  const segs = q<HTMLElement>(".lp-seg i");

  // fração do caminho em que o x do nó i é alcançado (busca binária; viewBox 1000, 6 colunas)
  const L = path.getTotalLength();
  const fr = R.map((_, i) => {
    const x = ((i + 0.5) / 6) * 1000;
    let lo = 0;
    let hi = L;
    for (let k = 0; k < 28; k++) {
      const m = (lo + hi) / 2;
      if (path.getPointAtLength(m).x < x) lo = m;
      else hi = m;
    }
    return lo / L;
  });

  const ring = (tl: gsap.core.Timeline, i: number, at: number) =>
    tl.to(rings[i], { keyframes: [{ opacity: 0.85, scale: 1, duration: 0.05 }, { opacity: 0, scale: 1.9, duration: 0.65, ease: "power2.out" }] }, at);

  // desktop: traço horizontal; com pin ou sem (altura baixa)
  const flowH = (trigger: ScrollTrigger.Vars): Cleanup => {
    path.setAttribute("pathLength", "1");
    path.style.strokeDasharray = "1";
    path.style.strokeDashoffset = "1";
    gsap.set(gl, { opacity: 0 });
    gsap.set(rings, { opacity: 0, scale: 1 });
    gsap.set(nodes, { scale: 1 });
    gsap.set(steps, { opacity: 0.35, y: 24 });
    gsap.set(glow, { opacity: 0.1 });
    cnt.classList.add("is-live");
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { ...trigger, invalidateOnRefresh: true },
      onUpdate: () => {
        const t = tl.time();
        const a = R.reduce((acc, r, i) => (t >= r - 0.25 ? i : acc), 0);
        cn.textContent = `0${a + 1}`;
      },
    });
    tl.to(glow, { opacity: 0.45, duration: 7.2 }, 0);
    R.forEach((r, i) => {
      const s = r - 0.25;
      tl.to(path, { strokeDashoffset: 1 - fr[i], duration: i ? r - R[i - 1] : r }, i ? R[i - 1] : 0)
        .to(gl[i], { opacity: 1, duration: 0.3 }, s)
        .to(nodes[i], { scale: 1.12, duration: 0.3, ease: "power2.out" }, s)
        .to(steps[i], { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, s - 0.1);
      ring(tl, i, s + 0.05);
      if (i) tl.to(nodes[i - 1], { scale: 1, duration: 0.3, ease: "power2.out" }, s);
    });
    tl.to(path, { strokeDashoffset: 0, duration: 0.7 }, 6.5).to({}, { duration: 0.01 }, 8);
    return () => {
      sec.classList.remove("is-pin");
      cnt.classList.remove("is-live");
      path.style.strokeDashoffset = "";
      path.style.strokeDasharray = "";
      path.removeAttribute("pathLength");
      cn.textContent = "01";
    };
  };

  const mm = gsap.matchMedia();
  mm.add(PIN, () => {
    sec.classList.add("is-pin");
    return flowH({ trigger: sec, start: "top top", end: pinEnd(2.8), pin: true, scrub: 0.5, anticipatePin: 1, refreshPriority: 1 });
  });
  mm.add(LOW, () => flowH({ trigger: ".lp-flow", start: "top 78%", end: "bottom 40%", scrub: 0.5 }));
  mm.add(MOBILE, () => {
    gsap.set(gl, { opacity: 0 });
    gsap.set(rings, { opacity: 0 });
    gsap.set(nodes, { scale: 1 });
    gsap.set(steps, { opacity: 0.35, y: 24 });
    gsap.set(glow, { opacity: 0.1 });
    gsap.set(segs, { scaleY: 0 });
    gsap.to(glow, { opacity: 0.45, ease: "none", scrollTrigger: { trigger: ".lp-flow", start: "top 70%", end: "bottom 50%", scrub: true } });
    steps.forEach((s, i) => {
      const t = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: s, start: "top 78%", end: "bottom 52%", scrub: 0.4 } });
      t.to(s, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0)
        .to(gl[i], { opacity: 1, duration: 0.12 }, 0)
        .to(nodes[i], { scale: 1.12, duration: 0.12 }, 0);
      ring(t, i, 0.02);
      if (segs[i]) t.to(segs[i], { scaleY: 1, duration: 0.8 }, 0.12);
      if (i < 5) t.to(nodes[i], { scale: 1, duration: 0.1 }, 0.9);
    });
  });
  return () => mm.revert();
}
