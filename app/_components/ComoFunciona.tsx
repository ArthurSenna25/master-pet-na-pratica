import { vars } from "./vars";

const PATH = "M0 110 C40 110 45 75 83.33 75 C140 75 193 38 250 75 C300 75 360 112 416.67 75 C470 75 520 38 583.33 75 C640 75 690 112 750 75 C800 75 860 38 916.67 75 C950 75 960 100 1000 100";

const STEPS = [
  { t: "Conversa", p: "Você conta seu momento. A Camila ouve.", prov: false },
  { t: "Mapa do negócio", p: "A Camila entende onde o seu dia trava: fluxo, equipe e números.", prov: true },
  { t: "Plano sob medida", p: "Um plano que só serve para o seu negócio, não um pacote pronto.", prov: true },
  { t: "Camila no seu negócio", p: "Encontros presenciais, com a sua equipe, no seu espaço, no seu fluxo real.", prov: false },
  { t: "Rotina que se sustenta", p: "Processos, preço e atendimento viram padrão, não esforço.", prov: false },
  { t: "Você no comando", p: "Você sai do operacional e passa a liderar o seu negócio.", prov: false },
];

export function ComoFunciona() {
  return (
    <section className="lp-sec lp-sec--navy" id="como" data-screen-label="04 Como funciona">
      <div className="mp-fx mp-fx--light-gold" /><div className="mp-fx mp-fx--light-blue" /><div className="mp-fx mp-fx--grain" /><div className="mp-fx mp-fx--vignette" />
      <div className="lp-wrap">
        <div className="lp-como-head">
          <div>
            <span className="mp-eyebrow mp-reveal" style={vars({ "--i": 0 })}>Como funciona</span>
            <h2 className="lp-h2 mp-reveal" style={vars({ "--i": 1, marginTop: 16, maxWidth: 760 })}>Seis passos, do primeiro contato ao seu dia a dia.</h2>
          </div>
          <div className="lp-count" aria-hidden="true"><b className="lp-count__n">01</b> / 06</div>
        </div>
        <div className="lp-flow">
          <div className="lp-flow__glow" aria-hidden="true" />
          <svg viewBox="0 0 1000 150" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="lp-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1000" y2="0">
                <stop offset="0" style={{ stopColor: "var(--mp-blue-200)" }} />
                <stop offset="1" style={{ stopColor: "var(--mp-gold-400)" }} />
              </linearGradient>
            </defs>
            <path className="lp-track" d={PATH} />
            <path className="lp-route" d={PATH} />
          </svg>
          <ol className="lp-flow__steps">
            {STEPS.map((s, i) => {
              const n = String(i + 1).padStart(2, "0");
              const last = i === STEPS.length - 1;
              return (
                <li className="lp-step2" key={n}>
                  {!last && <span className="lp-seg" aria-hidden="true" style={vars({ "--a": `${i * 20}%`, "--b": `${(i + 1) * 20}%` })}><i /></span>}
                  <div className="lp-node"><b className="lp-n"><span className="lp-n__r" aria-hidden="true" /><span className="lp-n__t">{n}</span><span className={last ? "lp-n__g lp-n__g--fill" : "lp-n__g"} aria-hidden="true">{n}</span></b></div>
                  <h3 className="lp-st">{s.t}</h3>
                  <p>{s.p}{s.prov && <span className="lp-prov">provisório</span>}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
