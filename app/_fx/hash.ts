import type { Cleanup } from "./util";

/**
 * Hash (#conversar, #acao...) + pins. O salto nativo do navegador acontece ANTES de os pin-spacers existirem (a página fica milhares de px
 * mais alta depois) e o ScrollTrigger.refresh() mexe na rolagem: o resultado era parar no topo (chromium) ou no meio de #acao (webkit).
 * Aqui: depois de criar as cenas e de cada refresh (load, fonts.ready), rolar de novo até o alvo, sem animação e respeitando o
 * scroll-padding-top do html (header). Para de seguir assim que a pessoa rola, toca ou digita.
 */
export interface SeguidorDeHash { reaplicar: () => void; assentar: () => void; parar: Cleanup }

/** O Chromium faz o scroll nativo até o fragmento DEPOIS do load, com o destino calculado durante o refresh (layout ainda mudando). Reaplicar nestes instantes cobre isso. */
const ASSENTAR_MS = [120, 450, 1000];

const SEM_HASH: SeguidorDeHash = { reaplicar: () => {}, assentar: () => {}, parar: () => {} };

function alvoDoHash(): HTMLElement | null {
  if (!location.hash) return null;
  try {
    return document.getElementById(decodeURIComponent(location.hash.slice(1)));
  } catch {
    return null; // hash com % inválido
  }
}

export function seguirHash(): SeguidorDeHash {
  if (!alvoDoHash()) return SEM_HASH;
  const restauracao = history.scrollRestoration;
  history.scrollRestoration = "manual"; // com F5 o navegador restaurava a posição antiga, antes dos pins
  const html = document.documentElement;
  const suave = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto"; // o CSS global é smooth: o salto nativo ao fragmento animaria com destino defasado
  const timers: ReturnType<typeof setTimeout>[] = [];
  let seguindo = true;
  const soltar = () => { seguindo = false; html.style.scrollBehavior = suave; };
  const eventos = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
  eventos.forEach((e) => addEventListener(e, soltar, { once: true, passive: true }));

  const reaplicar = () => {
    const el = alvoDoHash();
    if (!seguindo || !el) return;
    html.style.scrollBehavior = "auto";
    el.scrollIntoView({ block: "start", inline: "nearest" }); // respeita o scroll-padding-top do html (header)
  };

  return {
    reaplicar,
    assentar: () => {
      reaplicar();
      ASSENTAR_MS.forEach((ms) => timers.push(setTimeout(reaplicar, ms)));
    },
    parar: () => {
      timers.forEach(clearTimeout);
      eventos.forEach((e) => removeEventListener(e, soltar));
      html.style.scrollBehavior = suave;
      history.scrollRestoration = restauracao;
    },
  };
}
