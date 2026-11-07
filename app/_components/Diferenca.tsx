import Image from "next/image";
import { vars } from "./vars";

const LEAD = { fontSize: "clamp(20px,1.8vw,26px)", color: "var(--text-1)" };

export function Diferenca() {
  return (
    <section className="lp-sec lp-band" id="diferenca" data-screen-label="03 A diferença">
      <div className="lp-band__photo">
        <Image src="/images/camila-autoridade-02-900.webp" alt="Camila sorrindo, segurando tesouras de tosa em um salão de mármore" width={900} height={1125} sizes="(min-width: 900px) 58vw, 100vw" />
      </div>
      <div className="mp-fx mp-fx--grain" />
      <div className="lp-wrap">
        <div className="lp-stack">
          <span className="mp-eyebrow mp-reveal" style={vars({ "--i": 0 })}>A diferença</span>
          <h2 className="lp-h2 mp-reveal" style={vars({ "--i": 1, fontSize: "clamp(38px,4.8vw,88px)" })}>Conteúdo qualquer um tem.</h2>
          <p className="lp-lead mp-reveal" style={vars({ "--i": 2, ...LEAD })}>Você já sabe o que precisa mudar. Já viu, já anotou, já tentou. O que faltou foi alguém ao seu lado na hora de aplicar.</p>
          <p className="lp-lead mp-reveal" style={vars({ "--i": 2, ...LEAD })}>Aqui a Camila vai até o seu banho e tosa e aplica o método com a sua equipe, no seu espaço, no seu fluxo real.</p>
          <p className="lp-close mp-reveal" style={vars({ "--i": 3 })}>Entender é uma coisa. <em>Aplicar é outra.</em></p>
          <ul className="lp-marks mp-reveal" style={vars({ "--i": 4 })}>
            <li>No seu espaço</li><li>Com a sua equipe</li><li>No seu fluxo real</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
