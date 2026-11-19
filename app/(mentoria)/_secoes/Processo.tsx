import { textos } from "../textos";

export function Processo() {
  const t = textos();
  return (
    <section className="nm-proc" id="processo" aria-labelledby="h-proc" data-screen-label="04 Improviso ao processo">
      <div className="nm-wrap">
        <div className="nm-head" style={{ margin: "0" }}>
          <span className="nm-eyebrow">
            O que muda na rotina
          </span>
          <h2 className="nm-h2" id="h-proc">
            Do improviso ao processo.
          </h2>
        </div>
        <ol className="nm-pcs">
          <li className="nm-pc">
            <p className="nm-pc__a">
              <b>
                Antes
              </b>
              <span>
                O dia é decidido pela urgência
              </span>
            </p>
            <p className="nm-pc__d">
              <b>
                Depois
              </b>
              <svg className="nm-ico" aria-hidden="true" focusable="false">
                <use href="#nm-check" />
              </svg>
              O dia segue um plano
            </p>
          </li>
          <li className="nm-pc">
            <p className="nm-pc__a">
              <b>
                Antes
              </b>
              <span>
                Cada atendimento sai de um jeito
              </span>
            </p>
            <p className="nm-pc__d">
              <b>
                Depois
              </b>
              <svg className="nm-ico" aria-hidden="true" focusable="false">
                <use href="#nm-check" />
              </svg>
              Padrão combinado e escrito
            </p>
          </li>
          <li className="nm-pc">
            <p className="nm-pc__a">
              <b>
                Antes
              </b>
              <span>
                Preço por intuição
              </span>
            </p>
            <p className="nm-pc__d">
              <b>
                Depois
              </b>
              <svg className="nm-ico" aria-hidden="true" focusable="false">
                <use href="#nm-check" />
              </svg>
              Preço com conta e critério
            </p>
          </li>
          <li className="nm-pc">
            <p className="nm-pc__a">
              <b>
                Antes
              </b>
              <span>
                Você repete as mesmas orientações
              </span>
            </p>
            <p className="nm-pc__d">
              <b>
                Depois
              </b>
              <svg className="nm-ico" aria-hidden="true" focusable="false">
                <use href="#nm-check" />
              </svg>
              A equipe sabe o que fazer
            </p>
          </li>
          <li className="nm-pc">
            <p className="nm-pc__a">
              <b>
                Antes
              </b>
              <span>
                Tudo depende de você estar lá
              </span>
            </p>
            <p className="nm-pc__d">
              <b>
                Depois
              </b>
              <svg className="nm-ico" aria-hidden="true" focusable="false">
                <use href="#nm-check" />
              </svg>
              O processo funciona sem você na bancada
            </p>
          </li>
          <li className="nm-pc">
            <p className="nm-pc__a">
              <b>
                Antes
              </b>
              <span>
                Você decide cada detalhe
              </span>
            </p>
            <p className="nm-pc__d">
              <b>
                Depois
              </b>
              <svg className="nm-ico" aria-hidden="true" focusable="false">
                <use href="#nm-check" />
              </svg>
              Cada pessoa decide dentro do combinado
            </p>
          </li>
        </ol>
        <p className="nm-note">
          Sem promessa de resultado: a mudança vem de aplicar a trilha no seu negócio.
        </p>
        <div className="nm-cta">
          <a className="nm-btn nm-btn--lg" href="#lista" data-nm-magnet>
            <span>
              {t.cta}
            </span>
            <svg className="nm-ico" aria-hidden="true" focusable="false">
              <use href="#nm-arrow" />
            </svg>
          </a>
          <p className="nm-micro">
            {t.micro}
          </p>
        </div>
      </div>
    </section>
  );
}
