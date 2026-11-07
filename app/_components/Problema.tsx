import Image from "next/image";
import { vars } from "./vars";

const SIGNS = [
  ["01", "Ainda apaga incêndio todo dia", "O dia é decidido pela urgência, não pelo plano."],
  ["02", "Equipe sem padrão", "Cada atendimento sai de um jeito, conforme quem estiver na bancada."],
  ["03", "Preço no feeling", "Você cobra pelo que acha que o cliente aceita, não pelo que o serviço vale."],
  ["04", "O negócio para quando você para", "Se você sai, o negócio sente."],
] as const;

const FOTO = "/images/camila-autoridade-01-900.webp";

export function Problema() {
  return (
    <section className="lp-sec lp-sec--navy lp-prob" id="problema" data-screen-label="02 Problema">
      <div className="lp-prob__bg">
        <div className="lp-prob__sticky">
          <Image className="lp-prob__img" src={FOTO} alt="Camila olhando para o lado, com a rua ao fundo" width={900} height={1125} sizes="100vw" />
          <Image className="lp-prob__img lp-prob__img--bw" src={FOTO} alt="" aria-hidden="true" width={900} height={1125} sizes="100vw" />
          <div className="lp-prob__vig" />
          <div className="mp-fx mp-fx--vignette" />
        </div>
      </div>
      <div className="mp-fx mp-fx--grain" />
      <div className="lp-wrap">
        <div className="lp-stack lp-prob__intro">
          <span className="mp-eyebrow mp-reveal" style={vars({ "--i": 0, color: "var(--mp-blue-200)" })}>O problema</span>
          <h2 className="lp-h2 mp-reveal" style={vars({ "--i": 1, color: "#f9f5ec" })}>Você já assistiu, já estudou, talvez já tenha feito mentoria online.</h2>
          <p className="lp-lead mp-reveal" style={vars({ "--i": 2, color: "var(--text-on-navy-2)" })}>E na hora de aplicar no seu negócio, a rotina engoliu tudo.</p>
        </div>
      </div>
      <div className="lp-prob__stage" data-screen-label="02b Sinais">
        <div className="lp-wrap">
          <div className="lp-prob__col">
            <div className="lp-signs-wrap">
              <i className="lp-sline" aria-hidden="true" />
              <ol className="lp-signs">
                {SIGNS.map(([n, t, p]) => (
                  <li className="lp-sign" key={n}>
                    <i className="lp-mark" aria-hidden="true" />
                    <span className="lp-sign__n" aria-hidden="true">{n}</span>
                    <div><h3>{t}</h3><p>{p}</p></div>
                  </li>
                ))}
              </ol>
              <p className="lp-prob__close">Não falta conteúdo. Falta alguém aplicando com você.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
