import { textos } from "../textos";
import Image from "next/image";

export function Dia() {
  const t = textos();
  return (
    <section className="nm-dia" id="dia" aria-labelledby="h-dia" data-screen-label="02 Um dia na bancada">
      <figure className="nm-dia__face" aria-hidden="true">
        <Image src="/mentoria/camila-bancada.webp" width={900} height={1125} alt="" unoptimized />
      </figure>
      <div className="nm-dia__pin">
        <div className="nm-dia__stage">
          <div className="nm-dia__head">
            <span className="nm-eyebrow">
              Um dia na bancada
            </span>
            <h2 className="nm-h2" id="h-dia">
              Das 8h às 18h, quem decide tudo é você.
            </h2>
          </div>
          <div className="nm-clock" aria-hidden="true">
            <b data-nm-clock>
              08
            </b>
            <span>
              :00
            </span>
          </div>
          <ol className="nm-beats">
            <li className="nm-beat" data-h="8">
              <span className="nm-beat__t">
                08:00
              </span>
              <h3>
                O dia começa na correria
              </h3>
              <p>
                O que é urgente passa na frente do que importa. O plano fica para depois.
              </p>
            </li>
            <li className="nm-beat" data-h="11">
              <span className="nm-beat__t">
                11:00
              </span>
              <h3>
                Cada um faz do seu jeito
              </h3>
              <p>
                Duas pessoas, dois jeitos. O resultado depende de quem está na bancada.
              </p>
            </li>
            <li className="nm-beat" data-h="14">
              <span className="nm-beat__t">
                14:00
              </span>
              <h3>
                O preço vira palpite
              </h3>
              <p>
                Sem uma conta clara por trás, cobrar é adivinhar.
              </p>
            </li>
            <li className="nm-beat" data-h="16">
              <span className="nm-beat__t">
                16:00
              </span>
              <h3>
                Tudo passa por você
              </h3>
              <p>
                Você explica de novo, corrige de novo. E ninguém mais decide.
              </p>
            </li>
          </ol>
        </div>
        <div className="nm-diag" id="diag">
          <div className="nm-diag__q">
            <span className="nm-eyebrow">
              18:00 · Diagnóstico
            </span>
            <h3 className="nm-h3">
              Onde o seu dia trava?
            </h3>
            <p className="nm-muted">
              Escolha o que mais pesa hoje. Nada é enviado: a escolha só pré-seleciona o seu maior desafio no formulário e acende a estação da trilha.
            </p>
            <ul className="nm-picks">
              <li>
                <a className="nm-pick" href="#lista" data-pick="Gargalos" data-station="2" data-desafio="processos">
                  <span aria-hidden="true">
                    A
                  </span>
                  O dia vira correria e eu apago incêndio
                </a>
              </li>
              <li>
                <a className="nm-pick" href="#lista" data-pick="Equipe" data-station="3" data-desafio="equipe">
                  <span aria-hidden="true">
                    B
                  </span>
                  Cada pessoa da equipe faz de um jeito
                </a>
              </li>
              <li>
                <a className="nm-pick" href="#lista" data-pick="Precificação, combos e planos" data-station="4" data-desafio="preco">
                  <span aria-hidden="true">
                    C
                  </span>
                  Não sei se o meu preço está certo
                </a>
              </li>
              <li>
                <a className="nm-pick" href="#lista" data-pick="Padrões" data-station="5" data-desafio="atendimento">
                  <span aria-hidden="true">
                    D
                  </span>
                  O atendimento muda conforme quem atende
                </a>
              </li>
              <li>
                <a className="nm-pick" href="#lista" data-pick="Raio-X do negócio" data-station="1" data-desafio="tudo">
                  <span aria-hidden="true">
                    E
                  </span>
                  Não sei por onde começar
                </a>
              </li>
            </ul>
          </div>
          <div className="nm-diag__r">
            <div className="nm-out" aria-live="polite">
              <span className="nm-out__k">
                A sua trilha
              </span>
              <p className="nm-out__t">
                Escolha uma opção ao lado.
              </p>
              <p className="nm-out__d">
                Cada resposta acende uma estação da trilha.
              </p>
            </div>
            <ol className="nm-rail" aria-hidden="true">
              <li data-s="1">
                <i></i>
                <span>
                  Raio-X
                </span>
              </li>
              <li data-s="2">
                <i></i>
                <span>
                  Gargalos
                </span>
              </li>
              <li data-s="3">
                <i></i>
                <span>
                  Equipe
                </span>
              </li>
              <li data-s="4">
                <i></i>
                <span>
                  Preço
                </span>
              </li>
              <li data-s="5">
                <i></i>
                <span>
                  Padrões
                </span>
              </li>
              <li data-s="6">
                <i></i>
                <span>
                  Rotina
                </span>
              </li>
            </ol>
            <a className="nm-btn" href="#lista">
              {t.cta}{" "}
              <svg className="nm-ico" aria-hidden="true" focusable="false">
                <use href="#nm-arrow" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
