import { textos } from "../textos";
import Image from "next/image";

export function Abertura() {
  const t = textos();
  return (
    <section className="nm-hero" id="abertura" aria-labelledby="h-hero" data-screen-label="01 Abertura">
      <div className="nm-hero__bg" aria-hidden="true"></div>
      <div className="nm-hero__photo">
        <Image src="/mentoria/hero-camila.webp" width={1200} height={1500} alt="Camila Becari sorrindo, de terno branco, com o queixo apoiado na mão, sentada diante de um fundo escuro" priority unoptimized />
      </div>
      <div className="nm-hero__fade" aria-hidden="true"></div>
      <canvas className="nm-sparkles" aria-hidden="true"></canvas>
      <div className="nm-hero__inner">
        <div className="nm-hero__copy">
          <span className="nm-seal nm-seal--open">
            <i aria-hidden="true"></i>
            {t.selo}
          </span>
          <h1 className="nm-h1" id="h-hero" data-nm-lines>
            Um banho e tosa que funciona{" "}
            <em>
              sem depender de você
            </em>
            {" "}na bancada.
          </h1>
          <p className="nm-lead">
            {t.leadAbertura}
          </p>
          <div className="nm-hero__cta">
            <a className="nm-btn nm-btn--lg" href="#lista" data-nm-magnet>
              <span>
                {t.cta}
              </span>
              <svg className="nm-ico" aria-hidden="true" focusable="false">
                <use href="#nm-arrow" />
              </svg>
            </a>
            <span className="nm-note">
              {t.micro}
            </span>
          </div>
          <ul className="nm-facts">
            <li>
              <svg className="nm-ico" aria-hidden="true" focusable="false">
                <use href="#nm-spark" />
              </svg>
              Online e individual
            </li>
            <li>
              <svg className="nm-ico" aria-hidden="true" focusable="false">
                <use href="#nm-spark" />
              </svg>
              Cerca de 10 encontros de ~2 h{" "}
              <span className="nm-seal">
                provisório
              </span>
            </li>
            <li>
              <svg className="nm-ico" aria-hidden="true" focusable="false">
                <use href="#nm-spark" />
              </svg>
              Abertura: no ano que vem, data a definir
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
