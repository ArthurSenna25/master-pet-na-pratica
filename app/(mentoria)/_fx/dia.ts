import gsap from "gsap";
import { rise } from "./rise";
import { NOPIN, PIN, type Cleanup } from "./util";

const HORA_INICIAL = 8;
const HORA_FINAL = 18;
const POR_HORA = 0.47; // segundos de timeline por hora do relógio (handoff)
const FIM_VISIVEL = 0.94; // fração do percurso em que o Diagnóstico já está 100% visível (4,75 s de 5,05 s da timeline)

/**
 * Cena 2 · Um dia na bancada (handoff v4). Pin (PIN, por position: sticky no CSS; o GSAP só faz o scrub): o relógio avança de 08 a 18 com a rolagem, uma hora inteira por vez; cada dor entra na sua hora
 * (uma de cada vez) e, às 18h, o Diagnóstico toma o palco. Sem pin (NOPIN): as dores sobem ao entrar (só as abaixo da dobra).
 * Estado oculto só é aplicado aqui, depois da hidratação e só com pin; sem JS/reduced-motion tudo fica visível em sequência (relógio nem aparece).
 */
export function dia(): Cleanup {
  const sec = document.querySelector<HTMLElement>(".nm-dia");
  const beats = sec ? [...sec.querySelectorAll<HTMLElement>(".nm-beat")] : [];
  const relogio = sec?.querySelector<HTMLElement>("[data-nm-clock]");
  const diag = sec?.querySelector<HTMLElement>(".nm-diag");
  const palco = sec?.querySelector<HTMLElement>(".nm-dia__stage");
  if (!sec || !relogio || !diag || !palco || !beats.length) return () => {};

  const mm = gsap.matchMedia();
  mm.add(PIN, () => {
    sec.classList.add("is-pinned");
    const H = { h: HORA_INICIAL };
    let mostrada = HORA_INICIAL;
    gsap.set(beats, { autoAlpha: 0, y: 24 });
    // Diagnóstico: só opacity (NUNCA visibility:hidden) + pointer-events, para seguir na árvore de acessibilidade e no Tab desde o início.
    gsap.set(diag, { opacity: 0, y: 36, pointerEvents: "none" });
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true } });
    tl.to(H, {
      h: HORA_FINAL, ease: "none", duration: (HORA_FINAL - HORA_INICIAL) * POR_HORA,
      onUpdate: () => { const n = Math.round(H.h); if (n !== mostrada) { mostrada = n; relogio.textContent = String(n).padStart(2, "0"); } },
    }, 0);
    beats.forEach((b, i) => {
      const t0 = (Number(b.dataset.h) - HORA_INICIAL) * POR_HORA;
      const prox = beats[i + 1];
      const t1 = prox ? (Number(prox.dataset.h) - HORA_INICIAL) * POR_HORA : 4.0;
      tl.to(b, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power3.out" }, t0 + 0.05);
      if (prox) tl.to(b, { autoAlpha: 0, y: -18, duration: 0.25 }, t1 - 0.25);
    });
    tl.to(palco, { autoAlpha: 0, duration: 0.35 }, 4.1)
      .set(diag, { pointerEvents: "auto" }, 4.25)
      .to(diag, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 4.25)
      .to({}, { duration: 0.3 });
    // Foco (Tab, leitor de tela, focus()) entrando no Diagnóstico antes das 18h: rola até o fim do percurso; o scrub alinha o estado visual.
    const st = tl.scrollTrigger;
    const aoFocar = () => {
      if (!st || st.progress >= FIM_VISIVEL) return;
      const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // depois do scroll nativo do foco (no WebKit ele cancela um scrollTo feito dentro do próprio focusin)
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: st.end, behavior: reduz ? "auto" : "smooth" })));
    };
    diag.addEventListener("focusin", aoFocar);
    return () => {
      diag.removeEventListener("focusin", aoFocar);
      sec.classList.remove("is-pinned");
      relogio.textContent = String(HORA_INICIAL).padStart(2, "0");
      gsap.set([...beats, diag, palco], { clearProps: "all" });
    };
  });
  mm.add(NOPIN, () => rise(".nm-beat", sec));
  return () => mm.revert();
}
