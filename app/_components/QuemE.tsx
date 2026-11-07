import Image from "next/image";
import { vars } from "./vars";

const SIG1 = "M60 26 C36 10 10 32 14 56 C18 80 48 82 64 60 C72 49 66 70 78 66 C88 62 84 50 92 52 C94 62 100 68 110 60 C118 52 114 68 124 66 C134 64 130 50 138 52 C140 62 146 68 156 60 L168 24 C170 14 160 22 164 40 C168 60 176 76 192 62 C204 52 196 66 206 68 C218 68 214 52 224 54 C226 64 232 70 244 60 C252 52 248 66 258 66 C270 66 266 52 276 54 C278 64 286 70 300 58";
const SIG2 = "M18 84 C90 70 170 92 250 78 C276 73 296 74 306 70";

export function QuemE() {
  return (
    <section className="lp-sec lp-quem" id="quem" data-screen-label="07 Quem é a Camila">
      <div className="lp-quem__top">
        <div className="mp-fx mp-fx--light-gold" /><div className="mp-fx mp-fx--grain" />
        <div className="lp-wrap lp-quem__row">
          <div />
          <div className="lp-quem__t">
            <span className="mp-eyebrow mp-reveal" style={vars({ "--i": 0 })}>Quem é a Camila</span>
            <h2 className="lp-h2 mp-reveal" style={vars({ "--i": 1 })}>Quem vai estar ao seu lado na hora de aplicar.</h2>
          </div>
        </div>
      </div>
      <div className="lp-quem__bot">
        <div className="mp-fx mp-fx--grain" />
        <div className="lp-wrap lp-quem__row">
          <div />
          <div className="lp-quem__t">
            <ul className="lp-fichas mp-reveal" style={vars({ "--i": 2 })}>
              <li>Sócia do Center Vet</li><li>Especialista em banho e tosa</li><li>Referência em atendimento veterinário em Lins</li>
            </ul>
            <div className="lp-sig">
              <svg viewBox="0 0 320 96" role="img" aria-label="Assinatura de Camila Becari"><path pathLength={1} d={SIG1} /><path pathLength={1} d={SIG2} /></svg>
              <span className="lp-sig__n">Camila Becari</span>
            </div>
          </div>
        </div>
      </div>
      <div className="lp-quem__mark" aria-hidden="true">MASTER PET</div>
      <div className="lp-quem__fig">
        <div className="lp-wrap">
          <Image src="/images/camila-hero-retrato-900.webp" alt="Retrato da Camila, sentada, de terno branco" width={900} height={1349} sizes="(min-width: 900px) 40vw, 90vw" />
        </div>
      </div>
    </section>
  );
}
