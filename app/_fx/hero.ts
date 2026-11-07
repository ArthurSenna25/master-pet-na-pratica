import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import type { Cleanup } from "./util";

/** Cenas 1 (entrada) e 2 (saída). O véu fica em CSS (@keyframes). */
export function hero(): void {
  const h1 = document.querySelector<HTMLElement>(".lp-h1");
  if (!h1) return;

  gsap.set(".lp-hero .mp-eyebrow,.lp-hero .lp-sub,.lp-hero__copy > .mp-reveal", { opacity: 0, y: 24 });
  gsap
    .timeline()
    .fromTo(".lp-hero__bg", { scale: 1.15 }, { scale: 1, duration: 1.4, ease: "power3.out" }, 0)
    .to(".lp-hero .mp-eyebrow", { opacity: 1, y: 0, duration: 0.7, ease: "expo.out" }, 0.15)
    .to(".lp-hero .lp-sub", { opacity: 1, y: 0, duration: 0.7, ease: "expo.out" }, 0.95)
    .to(".lp-hero__copy > .mp-reveal", { opacity: 1, y: 0, duration: 0.7, ease: "expo.out", clearProps: "opacity,transform" }, 1.04)
    .fromTo(".lp-shine", { clipPath: "inset(0% 100% 0% -30%)" }, { clipPath: "inset(0% -30% 0% 100%)", duration: 1.1, ease: "power2.inOut" }, 1.3);

  // H1 por linhas (máscara .ln do CSS); re-divide sozinho se a quebra mudar (resize, fonte).
  SplitText.create(h1, {
    type: "lines",
    mask: "lines",
    linesClass: "ln__i",
    aria: "none",
    ignore: ".lp-shine",
    reduceWhiteSpace: false, // preserva o &nbsp; de "Banho & Tosa" (senão o split quebra a linha ali)
    autoSplit: true,
    onSplit: (self) => {
      gsap.set(self.lines, { yPercent: 100 });
      return gsap.to(self.lines, {
        yPercent: 0,
        duration: 0.9,
        stagger: 0.12,
        delay: 0.3,
        ease: "expo.out",
        onComplete: () => void gsap.set(h1.querySelectorAll(".ln__i-mask"), { overflow: "visible" }),
      });
    },
  });

  // 2 · saída (scrub)
  gsap
    .timeline({ scrollTrigger: { trigger: ".lp-hero", start: "top top", end: "bottom top", scrub: true } })
    .to(".lp-cover", { yPercent: 12, scale: 1.08, ease: "none" }, 0)
    .to(".lp-hero__copy", { y: -90, opacity: 0, ease: "power1.in" }, 0);
}

/** 1b · luz dourada que segue o cursor (só pointer fine). */
export function heroLight(): Cleanup | undefined {
  const zone = document.querySelector<HTMLElement>(".lp-hero");
  const light = zone?.querySelector<HTMLElement>("[data-light]");
  if (!zone || !light) return;
  const qx = gsap.quickTo(light, "x", { duration: 0.6, ease: "power3.out" });
  const qy = gsap.quickTo(light, "y", { duration: 0.6, ease: "power3.out" });
  const move = (e: PointerEvent) => {
    const r = zone.getBoundingClientRect();
    qx(((e.clientX - r.left) / r.width) * 120 - 60);
    qy(((e.clientY - r.top) / r.height) * 80 - 40);
  };
  const leave = () => {
    qx(0);
    qy(0);
  };
  zone.addEventListener("pointermove", move);
  zone.addEventListener("pointerleave", leave);
  return () => {
    zone.removeEventListener("pointermove", move);
    zone.removeEventListener("pointerleave", leave);
  };
}
