import { DEPOIMENTOS, DESTAQUE, iniciais, publicaveis, type Depoimento } from "../_lib/depoimentos";
import { DepoimentosFaixa } from "./DepoimentosFaixa";
import { vars } from "./vars";

const Selo = ({ d, className = "" }: { d: Depoimento; className?: string }) =>
  d.isExample ? <span className={`lp-prov ${className}`.trim()}>exemplo</span> : null;

const Quem = ({ d }: { d: Depoimento }) => (
  <figcaption>
    <span className="lp-av" aria-hidden="true">{iniciais(d.name)}</span>
    <span className="lp-who"><b>{d.name}</b><small>{d.business} · {d.city}</small><small>{d.team}</small></span>
  </figcaption>
);

export function Depoimentos() {
  const cards = publicaveis(DEPOIMENTOS);
  const fe = publicaveis([DESTAQUE])[0];
  return (
    <section className="lp-sec lp-sec--light lp-dep" id="depoimentos" data-screen-label="07 Depoimentos" aria-labelledby="dep-h2">
      <div className="mp-fx mp-fx--grain" />
      <div className="lp-wrap">
        <div className="lp-stack">
          <span className="mp-eyebrow mp-reveal" style={vars({ "--i": 0 })}>Depoimentos<span className="lp-prov">conteúdo de exemplo</span></span>
          <h2 id="dep-h2" className="lp-h2 lp-dep__h2 mp-reveal" style={vars({ "--i": 1 })}>Na voz de quem aplicou.</h2>
        </div>
        {fe && (
          <figure className="lp-fe">
            <div className="mp-fx mp-fx--grain" />
            <div className="lp-fe__body">
              <div className="lp-tc__top"><span className="lp-fe__mark" aria-hidden="true">“</span><Selo d={fe} /></div>
              <blockquote className="lp-fe__q"><p>{fe.quote}</p></blockquote>
              <Quem d={fe} />
            </div>
            <div className="lp-fe__ph" aria-hidden="true">
              <span className="lp-fe__img" /><span className="lp-fe__mono">{iniciais(fe.name)}</span>
              <span className="lp-fe__cap">Foto da cliente · opcional</span>
            </div>
          </figure>
        )}
        <DepoimentosFaixa>
          {cards.map((d, i) => (
            <li key={i} className="lp-tc" role="group" aria-roledescription="slide" aria-label={`${i + 1} de ${cards.length}`}>
              <figure className="lp-tc__in">
                <div className="lp-tc__top"><span className="lp-q-glyph" aria-hidden="true">“</span><Selo d={d} className="lp-tc__seal" /></div>
                <blockquote><p>{d.quote}</p></blockquote>
                <Quem d={d} />
              </figure>
            </li>
          ))}
        </DepoimentosFaixa>
        <figure className="lp-vid">
          <div className="lp-vid__f" aria-hidden="true">
            <span className="lp-prov lp-vid__seal">exemplo · vídeo opcional</span>
            <span className="lp-vid__play"><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg></span>
          </div>
          <figcaption>Espaço reservado para um depoimento em vídeo. Quando houver, só toca com clique, sem autoplay e com o som desligado até a pessoa ativar. Legenda: Nome da cliente, Salão exemplo, Cidade/UF.</figcaption>
        </figure>
        <div className="lp-dep__cta">
          <a className="mp-btn mp-btn--primary mp-btn--lg" href="#conversar">Quero conversar com a Camila</a>
          <p className="lp-tr">Depoimentos com autorização de cada pessoa.<span className="lp-prov">texto provisório</span></p>
        </div>
      </div>
    </section>
  );
}
