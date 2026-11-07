import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Função de limpeza devolvida por cada cena. */
export type Cleanup = () => void;

/** Toca o tween uma vez ao entrar (e também se a página já abriu depois do ponto: onRefresh). */
export function onceIn(trigger: gsap.DOMTarget, start: string, tween: gsap.core.Tween): void {
  ScrollTrigger.create({
    trigger,
    start,
    onEnter: () => void tween.play(),
    onRefresh: (self) => {
      if (self.progress > 0) tween.play();
    },
  });
}

/** Pin só em tela grande E alta; fora disso as cenas usam a versão sem pin (3m/4m). */
export const PIN = "(min-width:900px) and (min-height:720px)";
export const NOPIN = "(max-width:899px), (min-width:900px) and (max-height:719px)";
export const pinEnd = (k: number) => () => `+=${Math.round(innerHeight * k)}`;

export const all =<T extends HTMLElement = HTMLElement>(sel: string): T[] =>
  gsap.utils.toArray<T>(sel);
