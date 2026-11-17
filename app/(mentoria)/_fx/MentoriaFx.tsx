"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { abertura } from "./abertura";
import { dia } from "./dia";
import { realce, trilha } from "./trilha";
import type { Cleanup } from "./util";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const MOTION = "(prefers-reduced-motion: no-preference)";
const undo = (...fns: (Cleanup | undefined)[]): Cleanup => () => fns.forEach((f) => f?.());

/** Cenas GSAP da campanha mentoria (uma por etapa aprovada; hoje abertura, dia e trilha), criadas na ORDEM DO DOM. Não renderiza nada. Reduced-motion: nenhuma cena (página estática). */
export function MentoriaFx() {
  useGSAP(() => {
    const stopRealce = realce(); // estado do Diagnóstico → trilha, também sem movimento
    const mm = gsap.matchMedia();
    let vivo = true;
    mm.add(MOTION, () => {
      const stopAbertura = abertura();
      const stopDia = dia();
      const stopTrilha = trilha();
      ScrollTrigger.sort();
      const refrescar = () => { if (vivo) ScrollTrigger.refresh(); };
      window.addEventListener("load", refrescar);
      void document.fonts.ready.then(refrescar);
      return undo(stopAbertura, stopDia, stopTrilha, () => window.removeEventListener("load", refrescar));
    });
    return () => { vivo = false; mm.revert(); stopRealce(); };
  });
  return null;
}
