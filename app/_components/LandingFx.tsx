"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { header, magnet, progress, sticky } from "../_fx/chrome";
import { formEntrada } from "../_fx/form";
import { seguirHash } from "../_fx/hash";
import { hero, heroLight } from "../_fx/hero";
import { acao } from "../_fx/acao";
import { como } from "../_fx/como";
import { depoimentos, depoimentosHover } from "../_fx/depoimentos";
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
    // Hash na URL: reposiciona depois das cenas e de cada refresh (ver _fx/hash.ts). Vale também em reduced-motion (fontes mexem na altura).
    const hash = seguirHash();
    let refresh = () => {};
    const aoCarregar = () => { refresh(); hash.assentar(); };
    window.addEventListener("load", aoCarregar);
    let vivo = true;
    void document.fonts.ready.then(() => vivo && aoCarregar());

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
      const stopDepoimentos = depoimentos();
      destrava();
      quemEParaQuem();
      formEntrada();
      // sort uma vez, depois de todas as cenas; refresh no load e em fonts.ready
      ScrollTrigger.sort();
      refresh = () => ScrollTrigger.refresh();
      hash.reaplicar();
      return undo(cleanup, stopProblema, stopComo, stopAcao, stopDepoimentos, () => { refresh = () => {}; });
    });

    mm.add(FINE, () => undo(heroLight(), magnet(), destravaHover(), depoimentosHover()));

    return () => {
      vivo = false;
      window.removeEventListener("load", aoCarregar);
      hash.parar();
      mm.revert();
      stopSticky?.();
    };
  });

  return null;
}
