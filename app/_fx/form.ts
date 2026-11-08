import gsap from "gsap";
import { onceIn } from "./util";

/** Cena 9 (formulário). Só transform/opacity. Os 140/350 ms da troca de passo vêm de @keyframes lp-step-out/in (landing-v6.css). */
export const reduzido = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Entrada: título, texto e 1º passo sobem e aparecem quando o formulário chega. Roda dentro do matchMedia de LandingFx (sem reduced-motion). */
export function formEntrada(): void {
  onceIn(
    "#lp-form",
    "top 80%",
    gsap.fromTo(
      '.lp-form h2, .lp-form .lp-lead, .lp-form .lp-demo, .lp-form .lp-prog__t, .lp-form .lp-fs[data-step="1"]',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.06, paused: true, clearProps: "transform,opacity" },
    ),
  );
}

/** Saída do passo atual: 140 ms. */
export function sairPasso(el: HTMLElement, dir: 1 | -1): Promise<void> {
  el.style.setProperty("--dir", String(dir));
  el.classList.add("is-out");
  return new Promise((ok) => setTimeout(() => { el.classList.remove("is-out"); ok(); }, 140));
}

/** Entrada do próximo passo: 350 ms. */
export function entrarPasso(el: HTMLElement, dir: 1 | -1): Promise<void> {
  el.style.setProperty("--dir", String(dir));
  el.classList.add("is-in");
  return new Promise((ok) => setTimeout(() => { el.classList.remove("is-in"); ok(); }, 350));
}

/** Sucesso: selo cresce e o texto sobe. (O desenho do traço do check, com strokeDashoffset, ficou de fora: não é transform/opacity.) */
export function sucesso(raiz: HTMLElement): void {
  if (reduzido()) return;
  const ok = raiz.querySelector(".ok");
  if (ok) gsap.fromTo(ok, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.8)", clearProps: "transform,opacity" });
  gsap.fromTo(raiz.querySelectorAll("p, .lp-chip"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.35, clearProps: "transform,opacity" });
}
