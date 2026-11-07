import { CheckIcon } from "./icons";
import { vars } from "./vars";

const SIM = ["Negócio já em funcionamento", "Quer implementar", "Aceita ter a Camila por perto"];
const NAO = ["Quem busca só conteúdo gravado", "Quem ainda não tem banho e tosa"];

export function ParaQuem() {
  return (
    <section className="lp-sec lp-sec--navy lp-para" id="para-quem" data-screen-label="08 Para quem é">
      <div className="mp-fx mp-fx--light-gold" /><div className="mp-fx mp-fx--grain" /><div className="mp-fx mp-fx--vignette" />
      <div className="lp-wrap lp-para__grid">
        <div className="lp-para__l">
          <span className="mp-eyebrow mp-reveal" style={vars({ "--i": 0 })}>Para quem é</span>
          <h2 className="lp-para__h mp-reveal" style={vars({ "--i": 1 })}>Nem todo mundo precisa disso.</h2>
          <span className="lp-prov">provisório</span>
        </div>
        <div className="lp-para__r">
          <h3 className="lp-para__k">É para você</h3>
          <ul className="lp-yes">
            {SIM.map((t) => <li key={t}><CheckIcon size={32} strokeWidth={1.75} pathLength={1} /><span>{t}</span></li>)}
          </ul>
          <h3 className="lp-para__k lp-para__k--no">Não é para você</h3>
          <ul className="lp-no">
            {NAO.map((t) => <li key={t}><span>{t}<i className="lp-strike" aria-hidden="true" /></span></li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
