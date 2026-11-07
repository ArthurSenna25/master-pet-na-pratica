"use client";

// Abas, setas e tema por cena. Sem JS (ou antes de hidratar) o JSX já mostra o tema 01.
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { scrollToTema, showScene, TEMA_EVENT } from "../_fx/acao";
import { vars } from "./vars";

// px/py = posição do pin dourado em % da foto (4:5; MOTION.md, refino 6)
const TEMAS = [
  { c: "var(--mp-blue-200)", n: "01", t: "Fluxo de atendimento", px: 77.3, py: 68.5, src: "/images/camila-visita-01-1080.webp", w: 1080, h: 1349, alt: "Camila, sorrindo, orienta uma profissional de banho e tosa durante um atendimento" },
  { c: "var(--mp-gold-400)", n: "02", t: "Precificação", px: 79.6, py: 37.3, src: "/images/camila-autoridade-02-900.webp", w: 900, h: 1125, alt: "Camila sorrindo, segurando tesouras de tosa em um salão de mármore" },
  { c: "var(--mp-blue-300)", n: "03", t: "Padrão da equipe", px: 40.4, py: 61.8, src: "/images/camila-autoridade-01-900.webp", w: 900, h: 1125, alt: "Camila de colete com a marca Master Pet, olhando para o lado" },
];

const isTyping = (t: EventTarget | null) => t instanceof HTMLElement && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);

export function CamilaEmAcao() {
  const ref = useRef<HTMLElement>(null);
  const [tema, setTema] = useState(0);
  const shown = useRef(0); // tema já pintado nas cenas

  const select = (i: number) => {
    scrollToTema(i); // com pin: rola até a cena (o snap fecha no ponto); sem pin: não faz nada
    setTema(i);
  };

  useEffect(() => {
    const sec = ref.current;
    if (!sec || shown.current === tema) return;
    showScene(sec, shown.current, tema, !matchMedia("(prefers-reduced-motion: reduce)").matches);
    shown.current = tema;
  }, [tema]);

  // Tema vindo do pin (scroll) e setas ← → quando a seção ocupa o centro da tela. Cleanup no unmount.
  useEffect(() => {
    const sec = ref.current;
    if (!sec) return;
    const onTema = (e: Event) => setTema((e as CustomEvent<number>).detail);
    const onKey = (e: KeyboardEvent) => {
      if ((e.key !== "ArrowLeft" && e.key !== "ArrowRight") || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || isTyping(e.target)) return;
      const r = sec.getBoundingClientRect();
      if (!(r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5)) return;
      const n = shown.current + (e.key === "ArrowRight" ? 1 : -1);
      if (n < 0 || n >= TEMAS.length) return;
      e.preventDefault();
      scrollToTema(n);
      setTema(n);
    };
    sec.addEventListener(TEMA_EVENT, onTema);
    window.addEventListener("keydown", onKey);
    return () => {
      sec.removeEventListener(TEMA_EVENT, onTema);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const t = TEMAS[tema];
  return (
    <section ref={ref} className="lp-sec lp-sec--deep" id="acao" data-screen-label="06 Camila em ação">
      <div className="mp-fx mp-fx--light-gold" /><div className="mp-fx mp-fx--light-blue" />
      <div className="lp-acao__lights" aria-hidden="true">{TEMAS.map((x) => <i key={x.n} style={vars({ "--c": x.c })} />)}</div>
      <div className="mp-fx mp-fx--grain" /><div className="mp-fx mp-fx--vignette" />
      <div className="lp-wrap lp-acao6">
        <div className="lp-acao6__l">
          <div className="lp-stack lp-acao6__head">
            <span className="mp-eyebrow mp-reveal" style={vars({ "--i": 0 })}>Camila em ação</span>
            <h2 className="lp-h2 mp-reveal" style={vars({ "--i": 1 })}>Veja onde a Camila coloca a mão.</h2>
          </div>
          <div className="lp-tabs mp-reveal" style={vars({ "--i": 2, "--k": tema })} role="group" aria-label="Temas em destaque na foto">
            <i className="lp-tabs__ind" aria-hidden="true" />
            {TEMAS.map((x, i) => (
              <button type="button" className="lp-tab" aria-pressed={i === tema} style={vars({ "--c": x.c })} key={x.n} onClick={() => select(i)}>
                <span className="lp-tab__n" aria-hidden="true">{x.n}</span><span>{x.t}</span>
              </button>
            ))}
          </div>
          <div className="lp-ficha">
            <div className="lp-ficha__note" aria-live="polite">
              <strong>{t.t}</strong>
              <p>Texto de exemplo sobre este tema.</p>
              <span className="mp-cf__todo">[exemplo — substituir pelo conteúdo real da Camila]</span>
            </div>
          </div>
        </div>
        <figure className="lp-panel">
          <div className="lp-panel__photo">
            {TEMAS.map((x) => (
              <div className="lp-scene" style={vars({ "--c": x.c })} key={x.n}>
                <Image src={x.src} alt={x.alt} width={x.w} height={x.h} sizes="(min-width: 900px) 40vw, 100vw" />
                <i className="lp-scene__tint" />
              </div>
            ))}
            {/* decorativo: o tema é anunciado pela ficha e pelas abas. Só aparece no desktop (CSS). */}
            <span className="mp-cf__pin" aria-hidden="true" style={{ transform: `translate(${t.px}cqw, ${t.py}cqh)` }} />
          </div>
        </figure>
      </div>
    </section>
  );
}
