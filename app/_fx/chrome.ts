import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Cleanup } from "./util";

/** Header: .is-solid com scrollY > 40; .is-top (degradê) no topo. Funciona em qualquer navegador. */
export function header(): Cleanup | undefined {
  const hd = document.querySelector<HTMLElement>(".lp-header");
  if (!hd) return;
  const paint = () => {
    const solid = window.scrollY > 40;
    hd.classList.toggle("is-solid", solid);
    hd.classList.toggle("is-top", !solid);
  };
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: paint, onRefresh: paint });
  paint();
  return () => hd.classList.remove("is-solid", "is-top");
}

/** Cena 10 · barra de progresso. */
export function progress(): void {
  gsap.to(".lp-progress i", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });
}

/** CTA magnético (≤ 8 px, raio 56 px). Só pointer fine. */
export function magnet(): Cleanup {
  const btns = gsap.utils
    .toArray<HTMLElement>(".mp-btn--lg,.lp-header .mp-btn")
    .filter((b) => !b.closest(".lp-sticky"))
    .map((b) => ({
      b,
      x: gsap.quickTo(b, "x", { duration: 0.4, ease: "power3.out" }),
      y: gsap.quickTo(b, "y", { duration: 0.4, ease: "power3.out" }),
    }));
  const pull = (v: number) => Math.max(-8, Math.min(8, v * 0.2));
  const move = (e: PointerEvent) => {
    for (const m of btns) {
      const r = m.b.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) continue;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const near = Math.abs(dx) < r.width / 2 + 56 && Math.abs(dy) < r.height / 2 + 56;
      m.x(near ? pull(dx) : 0);
      m.y(near ? pull(dy) : 0);
    }
  };
  addEventListener("pointermove", move, { passive: true });
  return () => removeEventListener("pointermove", move);
}

/** StickyCta: aparece depois do hero, some no formulário; `inert` acompanha a visibilidade. */
export function sticky(): Cleanup | undefined {
  const st = document.querySelector<HTMLElement>(".lp-sticky");
  const hero = document.querySelector(".lp-hero");
  const form = document.querySelector("#conversar");
  if (!st || !hero || !form) return;
  const seen = { hero: true, form: false };
  const update = () => {
    const on = !seen.hero && !seen.form;
    st.classList.toggle("is-on", on);
    st.inert = !on;
  };
  const ioHero = new IntersectionObserver(([e]) => {
    seen.hero = e.isIntersecting;
    update();
  }, { threshold: 0.15 });
  const ioForm = new IntersectionObserver(([e]) => {
    seen.form = e.isIntersecting;
    update();
  }, { threshold: 0.05 });
  ioHero.observe(hero);
  ioForm.observe(form);
  return () => {
    ioHero.disconnect();
    ioForm.disconnect();
    st.classList.remove("is-on");
    st.inert = true;
  };
}
