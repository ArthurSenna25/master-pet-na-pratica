"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { abertura } from "./abertura";
import { dia } from "./dia";
import { realce, trilha } from "./trilha";
import { PIN, pinCabeNosDois, type Cleanup } from "./util";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const MOTION = "(prefers-reduced-motion: no-preference)";
const REAVALIA_MS = 150;
/** Quer pin agora? Critério PIN + o conteúdo dos DOIS cabe (mesma medição da ativação). Mudou o resultado → refaz Dia e Trilha. */
const querPin = (): boolean => window.matchMedia(PIN).matches && pinCabeNosDois();
const undo = (...fns: (Cleanup | undefined)[]): Cleanup => () => fns.forEach((f) => f?.());

/** Cenas GSAP da campanha mentoria (uma por etapa aprovada; hoje abertura, dia e trilha), criadas na ORDEM DO DOM. Não renderiza nada. Reduced-motion: nenhuma cena (página estática). */
export function MentoriaFx() {
  useGSAP(() => {
    const stopRealce = realce(); // estado do Diagnóstico → trilha, também sem movimento
    const mm = gsap.matchMedia();
    let vivo = true;
    mm.add(MOTION, () => {
      const stopAbertura = abertura();
      let stopDia = dia();
      let stopTrilha = trilha();
      ScrollTrigger.sort();
      const refrescar = () => { if (vivo) ScrollTrigger.refresh(); };
      window.addEventListener("load", refrescar);
      void document.fonts.ready.then(refrescar);

      // Reavalia o pin (limite + conteúdo cabe) em resize/orientação (debounce) e com fontes carregadas; só refaz Dia e Trilha se o resultado mudou.
      let timer = 0;
      const pinados = () => [".nm-dia", ".nm-trilha"].map((q) => !!document.querySelector(q)?.classList.contains("is-pinned"));
      const reavaliar = () => {
        if (!vivo) return;
        const quer = querPin(), p = pinados();
        if (quer ? p.every(Boolean) : !p.some(Boolean)) return; // já está como deve (os dois com pin ou os dois em cards)
        // âncora: a seção no topo da janela mantém a posição na tela depois da troca pin/cards (sem salto)
        const alvo = [...document.querySelectorAll<HTMLElement>("#conteudo > *")].find((e) => e.getBoundingClientRect().bottom > 1);
        const antes = alvo?.getBoundingClientRect().top ?? 0;
        stopDia(); stopTrilha();
        stopDia = dia(); stopTrilha = trilha();
        ScrollTrigger.sort(); ScrollTrigger.refresh();
        if (alvo) window.scrollTo({ top: window.scrollY + alvo.getBoundingClientRect().top - antes, behavior: "instant" }); // instant: o html pode ter scroll-behavior:smooth
      };
      const agendar = () => { window.clearTimeout(timer); timer = window.setTimeout(reavaliar, REAVALIA_MS); };
      window.addEventListener("resize", agendar);
      window.addEventListener("orientationchange", agendar);
      void document.fonts.ready.then(reavaliar);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("resize", agendar);
        window.removeEventListener("orientationchange", agendar);
        undo(stopAbertura, stopDia, stopTrilha, () => window.removeEventListener("load", refrescar))();
      };
    });
    return () => { vivo = false; mm.revert(); stopRealce(); };
  });
  return null;
}
