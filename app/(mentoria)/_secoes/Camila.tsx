import Image from "next/image";

export function Camila() {
  return (
    <section className="nm-cam" id="camila" aria-labelledby="h-camila" data-screen-label="05 Camila">
      <div className="nm-wrap nm-cam__grid">
        <figure className="nm-ph nm-cam__big" data-nm-ph>
          <Image src="/mentoria/camila-retrato.webp" width={900} height={1125} alt="Camila Becari sentada em uma cadeira de madeira, de terno branco, sorrindo, com fundo escuro" unoptimized />
        </figure>
        <div className="nm-cam__txt">
          <span className="nm-eyebrow">
            Quem é a Camila
          </span>
          <h2 className="nm-h2" id="h-camila">
            Quem vai caminhar com você.
          </h2>
          <p className="nm-pull">
            Ao seu lado, no ritmo do seu negócio.{" "}
            <span className="nm-seal">
              frase provisória
            </span>
          </p>
          <ul className="nm-fichas">
            <li>
              <svg className="nm-ico" aria-hidden="true" focusable="false">
                <use href="#nm-spark" />
              </svg>
              Sócia do Center Vet
            </li>
            <li>
              <svg className="nm-ico" aria-hidden="true" focusable="false">
                <use href="#nm-spark" />
              </svg>
              Especialista em banho e tosa
            </li>
            <li>
              <svg className="nm-ico" aria-hidden="true" focusable="false">
                <use href="#nm-spark" />
              </svg>
              Referência em atendimento veterinário em Lins/SP
            </li>
          </ul>
        </div>
        <figure className="nm-ph nm-cam__s1" data-nm-ph>
          <Image src="/mentoria/camila-logo.webp" width={720} height={900} alt="Camila Becari sorrindo, com a camiseta bordada Mentoria Master Pet, mãos unidas" unoptimized />
        </figure>
        <figure className="nm-ph nm-cam__s2" data-nm-ph>
          <Image src="/mentoria/camila-112.webp" width={720} height={900} alt="Camila Becari de pé, de camiseta clara e calça preta, mãos nos bolsos, sorrindo, em fundo claro" unoptimized />
        </figure>
      </div>
    </section>
  );
}
