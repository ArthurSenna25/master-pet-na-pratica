import Image from "next/image";
import { ArrowIcon } from "./icons";
import { vars } from "./vars";

export function Hero() {
  return (
    <section className="lp-hero lp-hero--1" data-tilt aria-label="Apresentação" data-screen-label="01 Hero">
      <div className="lp-hero__bg">
        <Image className="lp-cover" src="/images/hero-bg.webp" alt="Camila sorrindo, ao lado de uma profissional de banho e tosa no salão" fill priority sizes="100vw" />
      </div>
      <div className="mp-fx mp-fx--light-gold" data-light style={{ inset: "-10%" }} />
      <div className="mp-fx mp-fx--light-blue" />
      <div className="mp-fx mp-fx--scrim" />
      <div className="mp-fx lp-right-veil" />
      <div className="mp-fx mp-fx--vignette" />
      <div className="mp-fx mp-fx--grain" />
      <div className="lp-veil" />
      <div className="lp-wrap">
        <div className="lp-hero__copy">
          <span className="mp-eyebrow">Mentoria presencial e individual</span>
          <h1 className="lp-h1">
            <span className="lp-h1__a">Não é aula.</span>{" "}
            <span className="lp-nb">É a <em className="lp-gold">Camila<span className="lp-shine" aria-hidden="true">Camila</span></em></span>{" "}
            dentro do seu Banho&nbsp;&amp;&nbsp;Tosa, resolvendo com você.
          </h1>
          <p className="lp-sub">Para quem já tem banho e tosa e quer sair do operacional. Sócia do Center Vet, referência em atendimento veterinário em Lins.</p>
          <div className="mp-reveal" style={vars({ "--i": 3 })}>
            <a className="mp-btn mp-btn--primary mp-btn--lg mp-btn--glow" href="#conversar">
              Quero conversar com a Camila<span className="mp-btn__arrow"><ArrowIcon /></span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
