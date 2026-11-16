import Image from "next/image";

export function Bonus() {
  return (
    <section className="nm-sec nm-paper" id="bonus" aria-labelledby="h-bonus" data-screen-label="08 Bônus">
      <div className="nm-wrap nm-bonus__grid">
        <figure className="nm-arch nm-arch--sm">
          <Image src="/mentoria/camila-bonus.webp" width={720} height={900} alt="Camila Becari sorrindo, com a mão estendida, apresentando" unoptimized />
        </figure>
        <div className="nm-bonus__txt">
          <span className="nm-eyebrow">
            Bônus da lista{" "}
            <span className="nm-seal nm-seal--ex">
              exemplo
            </span>
          </span>
          <h2 className="nm-h2" id="h-bonus">
            Quem entra antes da abertura recebe um convite.
          </h2>
          <p className="nm-muted">
            Conteúdo fictício, só para a demonstração. O bônus real será definido pela Camila antes da publicação.
          </p>
          <div className="nm-invite" data-nm-tilt3d>
            <div className="nm-invite__face">
              <i className="nm-invite__sheen" aria-hidden="true"></i>
              <span className="nm-seal nm-seal--ex">
                exemplo
              </span>
              <span className="nm-invite__k">
                Convite da lista
              </span>
              <strong>
                Bônus exclusivo para a lista: a definir
              </strong>
              <p>
                Para quem entrar na lista antes da abertura da turma.
              </p>
              <a className="nm-btn" href="#lista" data-nm-magnet>
                <span>
                  Entrar na lista da turma
                </span>
                <svg className="nm-ico" aria-hidden="true" focusable="false">
                  <use href="#nm-arrow" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
