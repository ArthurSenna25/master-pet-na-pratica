
export function Trilha() {
  return (
    <section className="nm-trilha" id="trilha" aria-labelledby="h-trilha" data-screen-label="03 Trilha">
      <div className="nm-trilha__amb" aria-hidden="true"></div>
      <div className="nm-trilha__pin">
        <div className="nm-trilha__head">
          <span className="nm-eyebrow">
            A mentoria
          </span>
          <h2 className="nm-h2" id="h-trilha" data-nm-lines>
            Seis estações, feitas{" "}
            <em>
              com você.
            </em>
          </h2>
          <p className="nm-lead nm-muted">
            Primeiro entender o seu negócio. Depois montar, junto, o que o sustenta quando você não está. Um encontro individual de cada vez.
          </p>
        </div>
        <svg className="nm-ribbon" viewBox="0 0 800 1000" aria-hidden="true" focusable="false"></svg>
        <ol className="nm-deck" aria-label="As 6 estações da trilha">
          <i className="nm-thread" aria-hidden="true"></i>
          <li className="nm-st" data-st="1">
            <span className="nm-st__n" aria-hidden="true">
              01
            </span>
            <h3 className="nm-h3">
              Raio-X do negócio
            </h3>
            <p>
              Olhamos o seu negócio como ele é: pessoas, fluxo e números. Você sai com um mapa claro de onde o dia trava.
            </p>
          </li>
          <li className="nm-st" data-st="2">
            <span className="nm-st__n" aria-hidden="true">
              02
            </span>
            <h3 className="nm-h3">
              Gargalos
            </h3>
            <p>
              O que mais pesa vira prioridade, na ordem certa. Menos incêndio, mais direção.
            </p>
          </li>
          <li className="nm-st" data-st="3">
            <span className="nm-st__n" aria-hidden="true">
              03
            </span>
            <h3 className="nm-h3">
              Equipe
            </h3>
            <p>
              Treinamento para que todos atendam com o mesmo cuidado, mesmo sem você por perto.
            </p>
          </li>
          <li className="nm-st" data-st="4">
            <span className="nm-st__n" aria-hidden="true">
              04
            </span>
            <h3 className="nm-h3">
              Precificação, combos e planos
            </h3>
            <p>
              Preço com conta e critério. Combos e planos que fazem sentido para o seu negócio.
            </p>
          </li>
          <li className="nm-st" data-st="5">
            <span className="nm-st__n" aria-hidden="true">
              05
            </span>
            <h3 className="nm-h3">
              Padrões
            </h3>
            <p>
              O jeito de fazer, escrito e combinado. Para não depender de memória, nem de você.
            </p>
          </li>
          <li className="nm-st" data-st="6">
            <span className="nm-st__n" aria-hidden="true">
              06
            </span>
            <h3 className="nm-h3">
              Organização e métodos
            </h3>
            <p>
              Rotina organizada e métodos para manter o que foi implantado.
            </p>
          </li>
        </ol>
        <div className="nm-trilha__foot">
          <nav className="nm-stnav" aria-label="Ir para uma estação">
            <button type="button" data-st-go="prev" aria-label="Estação anterior">
              <svg className="nm-ico" aria-hidden="true" focusable="false">
                <use href="#nm-arrow" />
              </svg>
            </button>
            <button type="button" data-st-go="1" aria-label="Estação 1: Raio-X">
              1
            </button>
            <button type="button" data-st-go="2" aria-label="Estação 2: Gargalos">
              2
            </button>
            <button type="button" data-st-go="3" aria-label="Estação 3: Equipe">
              3
            </button>
            <button type="button" data-st-go="4" aria-label="Estação 4: Precificação">
              4
            </button>
            <button type="button" data-st-go="5" aria-label="Estação 5: Padrões">
              5
            </button>
            <button type="button" data-st-go="6" aria-label="Estação 6: Organização">
              6
            </button>
            <button type="button" data-st-go="next" aria-label="Próxima estação">
              <svg className="nm-ico" aria-hidden="true" focusable="false">
                <use href="#nm-arrow" />
              </svg>
            </button>
          </nav>
          <ul className="nm-tags">
            <li className="nm-tag">
              Cerca de 10 encontros individuais, de ~2 h{" "}
              <span className="nm-seal">
                provisório
              </span>
            </li>
            <li className="nm-tag">
              Exercícios no seu próprio banho e tosa
            </li>
            <li className="nm-tag">
              Materiais, acompanhamento e suporte
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
