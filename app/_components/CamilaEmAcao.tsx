// F2: marcação estática, sem diretiva client. Abas, cenas e pins entram na F3-motion.
import Image from "next/image";
import { vars } from "./vars";

const TEMAS = [
  { c: "var(--mp-blue-200)", n: "01", t: "Fluxo de atendimento", src: "/images/camila-visita-01-1080.webp", w: 1080, h: 1349, alt: "Camila, sorrindo, orienta uma profissional de banho e tosa durante um atendimento" },
  { c: "var(--mp-gold-400)", n: "02", t: "Precificação", src: "/images/camila-autoridade-02-900.webp", w: 900, h: 1125, alt: "Camila sorrindo, segurando tesouras de tosa em um salão de mármore" },
  { c: "var(--mp-blue-300)", n: "03", t: "Padrão da equipe", src: "/images/camila-autoridade-01-900.webp", w: 900, h: 1125, alt: "Camila de colete com a marca Master Pet, olhando para o lado" },
];

export function CamilaEmAcao() {
  return (
    <section className="lp-sec lp-sec--deep" id="acao" data-screen-label="06 Camila em ação">
      <div className="mp-fx mp-fx--light-gold" /><div className="mp-fx mp-fx--light-blue" />
      <div className="lp-acao__lights" aria-hidden="true">{TEMAS.map((t) => <i key={t.n} style={vars({ "--c": t.c })} />)}</div>
      <div className="mp-fx mp-fx--grain" /><div className="mp-fx mp-fx--vignette" />
      <div className="lp-wrap lp-acao6">
        <div className="lp-acao6__l">
          <div className="lp-stack lp-acao6__head">
            <span className="mp-eyebrow mp-reveal" style={vars({ "--i": 0 })}>Camila em ação</span>
            <h2 className="lp-h2 mp-reveal" style={vars({ "--i": 1 })}>Veja onde a Camila coloca a mão.</h2>
          </div>
          <div className="lp-tabs mp-reveal" style={vars({ "--i": 2 })} role="group" aria-label="Temas em destaque na foto">
            <i className="lp-tabs__ind" aria-hidden="true" />
            {TEMAS.map((t, i) => (
              <button type="button" className="lp-tab" aria-pressed={i === 0} style={vars({ "--c": t.c })} key={t.n}>
                <span className="lp-tab__n" aria-hidden="true">{t.n}</span><span>{t.t}</span>
              </button>
            ))}
          </div>
          <div className="lp-ficha">
            <div className="lp-ficha__note" aria-live="polite">
              <strong>{TEMAS[0].t}</strong>
              <p>Texto de exemplo sobre este tema.</p>
              <span className="mp-cf__todo">[exemplo — substituir pelo conteúdo real da Camila]</span>
            </div>
          </div>
        </div>
        <figure className="lp-panel">
          <div className="lp-panel__photo">
            {TEMAS.map((t) => (
              <div className="lp-scene" style={vars({ "--c": t.c })} key={t.n}>
                <Image src={t.src} alt={t.alt} width={t.w} height={t.h} sizes="(min-width: 900px) 40vw, 100vw" />
                <i className="lp-scene__tint" />
              </div>
            ))}
          </div>
        </figure>
      </div>
    </section>
  );
}
