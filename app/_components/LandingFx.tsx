"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { header, magnet, progress, sticky } from "../_fx/chrome";
import { hero, heroLight } from "../_fx/hero";
import { acao } from "../_fx/acao";
import { como } from "../_fx/como";
import { problema } from "../_fx/problema";
import { destrava, destravaHover, diferenca, quemEParaQuem, reveal } from "../_fx/secoes";
import type { Cleanup } from "../_fx/util";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const MOTION = "(prefers-reduced-motion: no-preference)";
const FINE = `${MOTION} and (hover: hover) and (pointer: fine)`;

const undo = (...fns: (Cleanup | undefined)[]): Cleanup => () => fns.forEach((f) => f?.());

/** Cenas GSAP da landing. Não renderiza nada. Reduced-motion: nenhuma cena (página estática). */
export function LandingFx() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    // Sticky CTA também em reduced-motion (sem transição: ver CSS); não depende de GSAP.
    const stopSticky = sticky();

    mm.add(MOTION, () => {
      // Ordem da página: pins criados fora de ordem dão alturas erradas. Cada cena pinada
      // tem seu próprio matchMedia interno (revertido no cleanup).
      const cleanup = undo(header());
      reveal();
      hero();
      progress();
      const stopProblema = problema();
      diferenca();
      const stopComo = como();
      const stopAcao = acao();
      destrava();
      quemEParaQuem();
      // sort uma vez, depois de todas as cenas; refresh no load e em fonts.ready
      ScrollTrigger.sort();
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      let live = true;
      void document.fonts.ready.then(() => live && refresh());
      return undo(cleanup, stopProblema, stopComo, stopAcao, () => {
        live = false;
        window.removeEventListener("load", refresh);
      });
    });

    mm.add(FINE, () => undo(heroLight(), magnet(), destravaHover()));

    return () => {
      mm.revert();
      stopSticky?.();
    };
  });

  return null;
}
