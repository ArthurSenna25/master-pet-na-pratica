"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { header, magnet, progress, sticky } from "../_fx/chrome";
import { hero, heroLight } from "../_fx/hero";
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

    mm.add(MOTION, () => {
      const cleanup = undo(header(), sticky());
      reveal();
      hero();
      progress();
      diferenca();
      destrava();
      quemEParaQuem();
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      void document.fonts.ready.then(refresh);
      return undo(cleanup, () => window.removeEventListener("load", refresh));
    });

    mm.add(FINE, () => undo(heroLight(), magnet(), destravaHover()));

    return () => mm.revert();
  });

  return null;
}
