import Image from "next/image";

export function Como() {
  return (
    <section className="nm-como" id="como" aria-labelledby="h-como" data-screen-label="07 Pré-inscrição">
      <div className="nm-wrap nm-como__grid">
        <div className="nm-como__l">
          <div>
            <span className="nm-eyebrow">
              Como funciona a pré-inscrição
            </span>
            <h2 className="nm-h2" id="h-como" style={{ marginTop: "8px" }}>
              Três passos. Nenhum pagamento.
            </h2>
          </div>
          <ol className="nm-tl">
            <li className="nm-tl__s">
              <span className="nm-tl__n" aria-hidden="true">
                1
              </span>
              <i className="nm-tl__line" aria-hidden="true"></i>
              <h3 className="nm-h3">
                Você entra na lista
              </h3>
              <p>
                Nome e WhatsApp, depois algumas perguntas sobre o seu negócio. Leva poucos minutos.
              </p>
            </li>
            <li className="nm-tl__s">
              <span className="nm-tl__n" aria-hidden="true">
                2
              </span>
              <i className="nm-tl__line" aria-hidden="true"></i>
              <h3 className="nm-h3">
                Você recebe o aviso
              </h3>
              <p>
                A Camila ou a equipe chama você no WhatsApp, individualmente. Ninguém é adicionado a grupo sem pedir.
              </p>
            </li>
            <li className="nm-tl__s">
              <span className="nm-tl__n" aria-hidden="true">
                3
              </span>
              <h3 className="nm-h3">
                A turma abre
              </h3>
              <p>
                No ano que vem, data a definir. O preço será divulgado na abertura e você decide ali.
              </p>
            </li>
          </ol>
          <div className="nm-answer">
            <strong>
              Preciso pagar para entrar na lista?
            </strong>
            <em>
              Não. Entrar na lista é gratuito.
            </em>
          </div>
        </div>
        <figure className="nm-arch">
          <Image src="/mentoria/camila-como.webp" width={720} height={900} alt="Camila Becari sorrindo e apontando para baixo, com as duas mãos, em direção à camiseta da Mentoria Master Pet" unoptimized />
        </figure>
      </div>
    </section>
  );
}
