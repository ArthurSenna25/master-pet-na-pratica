import type { Cleanup } from "./util";

/**
 * CTA flutuante (celular). Visível por padrão no CSS: sem JS, ou antes da hidratação, o CTA nunca some.
 * O JS só liga `.is-out` (transição) enquanto a abertura ou o formulário estão na tela. Não depende de GSAP nem de reduced-motion
 * (com reduced-motion o CSS global zera a transição). `.is-boot` evita animar a saída inicial quando a página abre no hero.
 */
export function fab(): Cleanup {
  const el = document.querySelector<HTMLElement>("[data-nm-fab]");
  const hero = document.querySelector(".nm-hero"), fim = document.querySelector(".nm-end");
  if (!el || !hero || !fim || !("IntersectionObserver" in window)) return () => {};
  let noHero = true, noForm = false, raf = 0;
  el.classList.add("is-boot");
  const io = new IntersectionObserver((es) => {
    for (const e of es) {
      if (e.target === hero) noHero = e.intersectionRatio > 0.15;
      else noForm = e.intersectionRatio > 0.1;
    }
    el.classList.toggle("is-out", noHero || noForm);
    if (!raf) raf = requestAnimationFrame(() => { raf = requestAnimationFrame(() => { raf = 0; el.classList.remove("is-boot"); }); });
  }, { threshold: [0, 0.1, 0.15, 0.3] });
  io.observe(hero); io.observe(fim);
  return () => { io.disconnect(); cancelAnimationFrame(raf); el.classList.remove("is-out", "is-boot"); };
}
