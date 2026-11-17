import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Cleanup } from "./util";

/** Sobe (opacity + y) os irmãos de `sel` quando o grupo entra na tela. Só o que está ABAIXO da dobra começa oculto (acima, nada é escondido: sem flash nem CLS). */
export function rise(sel: string, root: ParentNode = document): Cleanup {
  const grupos = new Map<Element, HTMLElement[]>();
  root.querySelectorAll<HTMLElement>(sel).forEach((n) => {
    const p = n.parentElement;
    if (p) grupos.set(p, [...(grupos.get(p) ?? []), n]);
  });
  const abaixo = (e: Element) => e.getBoundingClientRect().top > window.innerHeight * 0.92;
  const anims: gsap.core.Animation[] = [];
  const triggers: ScrollTrigger[] = [];
  const tocados: HTMLElement[] = [];
  grupos.forEach((filhos, pai) => {
    if (!abaixo(filhos[0])) return;
    tocados.push(...filhos);
    gsap.set(filhos, { opacity: 0, y: 36 });
    triggers.push(ScrollTrigger.create({
      trigger: pai, start: "top 85%", once: true,
      onEnter: () => anims.push(gsap.to(filhos, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, clearProps: "opacity,transform" })),
    }));
  });
  return () => {
    anims.forEach((a) => a.kill()); triggers.forEach((t) => t.kill());
    gsap.set(tocados, { clearProps: "opacity,transform" });
  };
}
