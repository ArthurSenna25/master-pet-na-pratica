"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const MOBILE = "(max-width:899px)";
const FOLGA = 2; // px de tolerância do fim da faixa (subpixel)

const Seta = ({ d }: { d: string }) => (
  <svg className="mp-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

/**
 * Faixa rolável dos cartões (só abaixo de 900 px; acima é grade estática). Rolagem nativa com snap + setas + ←/→ + arrastar com mouse.
 * Sem rotação automática. Sem JS a faixa rola por toque e as setas ficam ocultas (classe is-js só depois de hidratar).
 */
export function DepoimentosFaixa({ children }: { children: ReactNode }) {
  const trilho = useRef<HTMLUListElement>(null);
  const [js, setJs] = useState(false);
  const [inicio, setInicio] = useState(true);
  const [fim, setFim] = useState(false);

  useEffect(() => {
    const tr = trilho.current;
    if (!tr) return;
    setJs(true);
    const mq = matchMedia(MOBILE);
    const reduzido = matchMedia("(prefers-reduced-motion: reduce)");

    // Tab stop da lista só no celular (no desktop os cartões não precisam de foco); reage a mudança de largura.
    const foco = () => (mq.matches ? tr.setAttribute("tabindex", "0") : tr.removeAttribute("tabindex"));
    const estado = () => {
      setInicio(tr.scrollLeft <= FOLGA);
      setFim(tr.scrollLeft >= tr.scrollWidth - tr.clientWidth - FOLGA);
    };
    const ir = (k: number) => {
      const c = tr.querySelector<HTMLElement>(".lp-tc");
      if (!c || !mq.matches) return;
      const passo = c.getBoundingClientRect().width + (parseFloat(getComputedStyle(tr).columnGap) || 14);
      tr.scrollBy({ left: k * passo, behavior: reduzido.matches ? "auto" : "smooth" });
    };
    const aoTeclar = (e: KeyboardEvent) => {
      if (!mq.matches || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
      e.preventDefault();
      ir(e.key === "ArrowRight" ? 1 : -1);
    };
    const aoSetaAnt = () => ir(-1);
    const aoSetaProx = () => ir(1);

    let arraste: { x: number; l: number } | null = null;
    const aoPressionar = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !mq.matches) return;
      arraste = { x: e.clientX, l: tr.scrollLeft };
      tr.classList.add("is-drag");
      tr.setPointerCapture(e.pointerId);
    };
    const aoMover = (e: PointerEvent) => { if (arraste) tr.scrollLeft = arraste.l - (e.clientX - arraste.x); };
    const aoSoltar = () => { arraste = null; tr.classList.remove("is-drag"); };

    const ant = tr.parentElement?.querySelector<HTMLButtonElement>('[data-dir="-1"]');
    const prox = tr.parentElement?.querySelector<HTMLButtonElement>('[data-dir="1"]');
    foco();
    estado();
    mq.addEventListener("change", foco);
    tr.addEventListener("scroll", estado, { passive: true });
    addEventListener("resize", estado);
    tr.addEventListener("keydown", aoTeclar);
    tr.addEventListener("pointerdown", aoPressionar);
    tr.addEventListener("pointermove", aoMover);
    tr.addEventListener("pointerup", aoSoltar);
    tr.addEventListener("pointercancel", aoSoltar);
    ant?.addEventListener("click", aoSetaAnt);
    prox?.addEventListener("click", aoSetaProx);
    return () => {
      mq.removeEventListener("change", foco);
      tr.removeEventListener("scroll", estado);
      removeEventListener("resize", estado);
      tr.removeEventListener("keydown", aoTeclar);
      tr.removeEventListener("pointerdown", aoPressionar);
      tr.removeEventListener("pointermove", aoMover);
      tr.removeEventListener("pointerup", aoSoltar);
      tr.removeEventListener("pointercancel", aoSoltar);
      ant?.removeEventListener("click", aoSetaAnt);
      prox?.removeEventListener("click", aoSetaProx);
    };
  }, []);

  return (
    <div className={js ? "lp-tcs is-js" : "lp-tcs"} role="region" aria-roledescription="carrossel" aria-label="Mais depoimentos (exemplos)">
      <ul ref={trilho} className="lp-tcs__track" aria-label="Depoimentos em faixa rolável. Use as setas do teclado para navegar.">
        {children}
      </ul>
      <div className="lp-tcs__bar">
        <span className="lp-tcs__hint" aria-hidden="true">Deslize para ver mais</span>
        <div className="lp-tcs__btns">
          <button type="button" className="lp-tcs__b" data-dir="-1" aria-label="Depoimento anterior" aria-disabled={inicio}><Seta d="m15 6-6 6 6 6" /></button>
          <button type="button" className="lp-tcs__b" data-dir="1" aria-label="Próximo depoimento" aria-disabled={fim}><Seta d="m9 6 6 6-6 6" /></button>
        </div>
      </div>
    </div>
  );
}
