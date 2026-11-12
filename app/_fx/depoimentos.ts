import gsap from "gsap";
import { all, onceIn, type Cleanup } from "./util";

const MOBILE = "(max-width:899px)";
const abaixoDaDobra = (el: Element) => el.getBoundingClientRect().top > innerHeight;

/**
 * Depoimentos (nível 2, MOTION.md do handoff). Criada na ordem da página (depois de #acao, antes de #quem).
 * Sem pin, sem loop. Só opacity/transform/clip-path. O estado oculto vem de fromTo pós-hidratação e só para o que está abaixo da dobra.
 */
export function depoimentos(): Cleanup {
  const fe = document.querySelector<HTMLElement>("#depoimentos .lp-fe");
  const trilho = document.querySelector<HTMLElement>("#depoimentos .lp-tcs__track");
  if (!fe || !trilho) return () => {};

  // A1 · destaque em cascata (1x)
  if (abaixoDaDobra(fe)) {
    onceIn(fe, "top 78%", gsap.fromTo(gsap.utils.toArray(".lp-fe__body > *", fe), { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1, paused: true }));
  }
  // A2 · foto abre por clip-path (scrub)
  gsap.fromTo(fe.querySelector(".lp-fe__ph"), { clipPath: "inset(14% 14% 14% 14%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: fe, start: "top 85%", end: "top 35%", scrub: true } });
  // A3 · parallax do bloco/foto e do monograma (scrub)
  const par = { trigger: fe, start: "top bottom", end: "bottom top", scrub: true };
  gsap.fromTo(fe.querySelector(".lp-fe__img, .lp-fe__ph img"), { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: par });
  gsap.fromTo(fe.querySelector(".lp-fe__mono"), { y: 30 }, { y: -30, ease: "none", scrollTrigger: par });

  // B1 (grade, ≥900) e B2 (faixa, <900): entrada 1x; clearProps libera o hover 3D
  const mm = gsap.matchMedia();
  mm.add("(min-width:900px)", () => {
    if (!abaixoDaDobra(trilho)) return;
    onceIn(trilho, "top 85%", gsap.fromTo(gsap.utils.toArray(".lp-tc", trilho), { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.09, paused: true, clearProps: "opacity,transform" }));
  });
  mm.add(MOBILE, () => {
    if (!abaixoDaDobra(trilho)) return;
    onceIn(trilho, "top 90%", gsap.fromTo(trilho, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", paused: true, clearProps: "opacity,transform" }));
  });
  return () => mm.revert();
}

/** C · inclinação 3D sutil no hover (só mouse; desligada <900 px). ±6° cartões, ±2,5° destaque. */
export function depoimentosHover(): Cleanup {
  const undo: Cleanup[] = [];
  const mobile = matchMedia(MOBILE);
  all("#depoimentos .lp-tc__in, #depoimentos .lp-fe").forEach((el) => {
    const a = el.classList.contains("lp-fe") ? 2.5 : 6;
    gsap.set(el, { transformPerspective: 900, transformOrigin: "50% 50%" });
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.45, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.45, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      if (mobile.matches) return;
      const r = el.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * a * 2);
      rx(-((e.clientY - r.top) / r.height - 0.5) * a * 2);
    };
    const leave = () => { rx(0); ry(0); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    undo.push(() => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "transform" });
    });
  });
  return () => undo.forEach((f) => f());
}
