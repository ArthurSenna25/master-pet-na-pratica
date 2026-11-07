import Image from "next/image";
import { FaqItem } from "./FaqItem";
import { vars } from "./vars";

const Prov = () => <span className="lp-prov">provisório</span>;

export function Faq() {
  return (
    <section className="lp-sec lp-sec--blue" id="faq" data-screen-label="09 FAQ">
      <div className="mp-fx mp-fx--grain" />
      <div className="lp-wrap">
        <span className="mp-eyebrow mp-reveal" style={vars({ "--i": 0 })}>Perguntas frequentes<Prov /></span>
        <h2 className="lp-h2 mp-reveal" style={vars({ "--i": 1, marginTop: 16 })}>Antes de conversar.</h2>
        <div className="lp-faq2">
          <div className="lp-qs">
            <FaqItem pergunta="A Camila vai até o meu negócio?" delay={2}>Sim, é o formato.</FaqItem>
            <FaqItem pergunta="Quantos encontros?" delay={3}>Planejados sob medida.<Prov /></FaqItem>
            <FaqItem pergunta="Quanto custa?" delay={4}>Depende do seu negócio; a Camila explica na conversa.<Prov /></FaqItem>
            <FaqItem pergunta="O que acontece depois de enviar?" delay={5}>A Camila ou a equipe Master Pet te chama no WhatsApp.</FaqItem>
          </div>
          <aside className="lp-ask mp-reveal" style={vars({ "--i": 3 })}>
            <div className="lp-ask__ph">
              <Image src="/images/camila-cta-900.webp" alt="Camila sorrindo e apontando para baixo, em direção ao botão" width={900} height={1125} sizes="(min-width: 900px) 30vw, 90vw" />
            </div>
            <p className="lp-ask__q">Ainda com dúvida?</p>
            <a className="mp-btn mp-btn--primary mp-btn--lg mp-btn--block" href="#conversar">Quero conversar com a Camila</a>
          </aside>
        </div>
      </div>
    </section>
  );
}
