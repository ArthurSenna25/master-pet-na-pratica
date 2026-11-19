
export function ParaQuem() {
  return (
    <section className="nm-sec nm-paper" id="para-quem" aria-labelledby="h-quem" data-screen-label="06 Para quem">
      <div className="nm-wrap">
        <div className="nm-head">
          <span className="nm-eyebrow">
            Para quem é{" "}
            <span className="nm-seal">
              provisório
            </span>
          </span>
          <h2 className="nm-h2" id="h-quem">
            Nem todo mundo precisa disso.
          </h2>
        </div>
        <div className="nm-who">
          <div className="nm-who__c">
            <h3 className="nm-h3">
              É para você
            </h3>
            <ul>
              <li>
                <svg className="nm-ico" aria-hidden="true" focusable="false">
                  <use href="#nm-check" />
                </svg>
                <span>
                  Tem um banho e tosa em funcionamento
                </span>
              </li>
              <li>
                <svg className="nm-ico" aria-hidden="true" focusable="false">
                  <use href="#nm-check" />
                </svg>
                <span>
                  Quer organizar processos, preço e equipe
                </span>
              </li>
              <li>
                <svg className="nm-ico" aria-hidden="true" focusable="false">
                  <use href="#nm-check" />
                </svg>
                <span>
                  Topa aplicar os exercícios no próprio negócio
                </span>
              </li>
            </ul>
          </div>
          <div className="nm-who__c nm-who__c--no">
            <h3 className="nm-h3">
              Não é para você
            </h3>
            <ul>
              <li>
                <svg className="nm-ico" aria-hidden="true" focusable="false">
                  <use href="#nm-x" />
                </svg>
                <span>
                  Quem busca só conteúdo gravado
                </span>
              </li>
              <li>
                <svg className="nm-ico" aria-hidden="true" focusable="false">
                  <use href="#nm-x" />
                </svg>
                <span>
                  Quem ainda não tem banho e tosa
                </span>
              </li>
              <li>
                <svg className="nm-ico" aria-hidden="true" focusable="false">
                  <use href="#nm-x" />
                </svg>
                <span>
                  Quem espera mudança sem aplicar
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
