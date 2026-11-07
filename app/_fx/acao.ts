import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PIN, pinEnd, type Cleanup } from "./util";

/** 5 · Camila em ação. O estado (tema) vive no componente React; aqui ficam o pin/snap e a troca de cena. */
export const TEMA_EVENT = "acao:tema";
const N_TEMAS = 3;

let pinST: ScrollTrigger | null = null;
let tw: gsap.core.Timeline | null = null;

/** Com pin ativo, rola até o ponto do tema (o snap garante 0 · ⅓ · ⅔). Devolve false sem pin. */
export function scrollToTema(i: number): boolean {
  if (!pinST) return false;
  pinST.scroll(pinST.start + (i / N_TEMAS) * (pinST.end - pinST.start));
  return true;
}

/** Pin + snap só em PIN. O tema atual sai por CustomEvent na própria seção (o componente escuta e faz cleanup). */
export function acao(): Cleanup {
  const sec = document.querySelector<HTMLElement>("#acao");
  if (!sec) return () => {};
  const mm = gsap.matchMedia();
  mm.add(PIN, () => {
    sec.classList.add("is-pin");
    let last = 0;
    pinST = ScrollTrigger.create({
      trigger: sec,
      start: "top top",
      end: pinEnd(2.7),
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      refreshPriority: 1,
      snap: { snapTo: [0, 1 / 3, 2 / 3, 1], duration: { min: 0.2, max: 0.55 }, delay: 0.1, ease: "power2.inOut" },
      onUpdate: (s) => {
        const i = Math.min(N_TEMAS - 1, Math.round(s.progress * N_TEMAS));
        if (i === last) return;
        last = i;
        sec.dispatchEvent(new CustomEvent<number>(TEMA_EVENT, { detail: i }));
      },
    });
    return () => {
      sec.classList.remove("is-pin");
      pinST = null;
    };
  });
  return () => {
    mm.revert();
    tw?.kill();
    tw = null;
  };
}

/** Troca de cena: instantânea (reduced-motion ou animate=false) ou clip-path + opacity + scale (0,6 s). */
export function showScene(sec: HTMLElement, prev: number, next: number, animate: boolean): void {
  tw?.kill();
  tw = null;
  const scs = [...sec.querySelectorAll<HTMLElement>(".lp-scene")];
  const lights = [...sec.querySelectorAll<HTMLElement>(".lp-acao__lights i")];
  const note = sec.querySelector<HTMLElement>(".lp-ficha__note");
  if (!animate) {
    scs.forEach((s, k) => {
      s.style.opacity = k === next ? "1" : "0";
      s.style.zIndex = k === next ? "2" : "1";
      s.style.clipPath = "";
      s.querySelector("img")?.style.removeProperty("transform");
    });
    lights.forEach((l, k) => (l.style.opacity = k === next ? "1" : "0"));
    return;
  }
  const a = scs[prev];
  const b = scs[next];
  scs.forEach((s, k) => {
    if (k !== prev && k !== next) {
      s.style.opacity = "0";
      s.style.zIndex = "1";
    }
  });
  a.style.opacity = "1";
  a.style.zIndex = "2";
  b.style.zIndex = "3";
  tw = gsap.timeline({
    onComplete: () => {
      a.style.opacity = "0";
      a.style.zIndex = "1";
      b.style.zIndex = "2";
      b.style.clipPath = "";
      tw = null;
    },
  });
  tw.fromTo(b, { opacity: 0, clipPath: "inset(0% 100% 0% 0%)" }, { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power2.inOut" }, 0)
    .fromTo(b.querySelector("img"), { scale: 1.06 }, { scale: 1, duration: 0.6, ease: "power2.out", clearProps: "transform" }, 0)
    .to(a, { opacity: 0, duration: 0.3, ease: "none" }, 0.3);
  lights.forEach((l, k) => void gsap.to(l, { opacity: k === next ? 1 : 0, duration: 0.6, ease: "none", overwrite: true }));
  if (note) gsap.fromTo(note, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none", clearProps: "opacity" });
}
