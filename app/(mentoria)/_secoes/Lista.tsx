import Image from "next/image";
import { FormularioMentoria } from "../FormularioMentoria";

export function Lista() {
  return (
    <section className="nm-end" id="lista" aria-labelledby="h-lista" data-screen-label="11 Formulário">
      <div className="nm-end__bg" aria-hidden="true"></div>
      <div className="nm-wrap nm-end__grid">
        <div className="nm-end__l">
          <figure className="nm-end__card">
            <Image src="/mentoria/camila-retrato.webp" width={900} height={1125} alt="Camila Becari sentada em uma cadeira de madeira, de terno branco, sorrindo, com fundo escuro" unoptimized />
            <figcaption className="nm-end__over">
              <span className="nm-eyebrow">
                Pré-inscrição
              </span>
              <h2 className="nm-h2" id="h-lista" data-nm-lines>
                Seu banho e tosa pode andar{" "}
                <em>
                  sem você presa na bancada.
                </em>
              </h2>
            </figcaption>
          </figure>
          <div className="nm-end__copy">
            <p className="nm-lead">
              Entre na lista da turma e receba o aviso da abertura em primeira mão.
            </p>
            <ul>
              <li>
                <svg className="nm-ico" aria-hidden="true" focusable="false">
                  <use href="#nm-spark" />
                </svg>
                <span>
                  Aviso em primeira mão, no WhatsApp
                </span>
              </li>
              <li>
                <svg className="nm-ico" aria-hidden="true" focusable="false">
                  <use href="#nm-spark" />
                </svg>
                <span>
                  Contato individual da Camila ou da equipe
                </span>
              </li>
              <li>
                <svg className="nm-ico" aria-hidden="true" focusable="false">
                  <use href="#nm-spark" />
                </svg>
                <span>
                  Sem pagar nada para entrar
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div>
          <FormularioMentoria />
        </div>
      </div>
    </section>
  );
}
