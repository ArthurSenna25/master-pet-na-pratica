import { Diagnostico } from "../Diagnostico";
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
        <Diagnostico cta={t.cta} />
      </div>
    </section>
  );
}
