// F2: prévia visual, sem estado, sem action. Passos, validação e envio entram na F4-banco.
import Image from "next/image";
import Link from "next/link";
import { BrandChip } from "./BrandChip";
import { ArrowIcon, CheckIcon } from "./icons";

interface FieldProps {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "tel";
}

function Field({ id, name, label, type = "text", ...rest }: FieldProps) {
  return (
    <div className="mp-field" data-req="">
      <label className="mp-field__label" htmlFor={id}>{label}</label>
      <div className="mp-field__control"><input id={id} className="mp-field__input" name={name} type={type} {...rest} /></div>
    </div>
  );
}

function Group({ legend, name, options, prov }: { legend: string; name: string; options: string[]; prov?: boolean }) {
  return (
    <fieldset className="lp-group" data-choice="">
      <legend>{legend}{prov && <span className="lp-prov">opções provisórias</span>}</legend>
      <div className="lp-choices">
        {options.map((o) => (
          <label className="lp-choice" key={o}><input type="radio" name={name} value={o} /><span>{o}</span></label>
        ))}
      </div>
    </fieldset>
  );
}

export function LeadForm() {
  return (
    <section className="lp-sec lp-end" id="conversar" data-screen-label="10 Formulário">
      <div className="lp-end__photo" aria-hidden="true">
        <Image src="/images/camila-cta-900.webp" alt="" width={900} height={1125} sizes="(min-width: 900px) 66vw, 100vw" />
        <i className="lp-end__mul" /><i className="lp-end__lift" />
      </div>
      <div className="lp-end__scrim" aria-hidden="true" />
      <div className="mp-fx mp-fx--light-gold" /><div className="mp-fx mp-fx--grain" /><div className="mp-fx mp-fx--vignette" />
      <div className="lp-wrap lp-end__grid">
        <form className="lp-form lp-glass" id="lp-form" noValidate aria-label="Quero conversar com a Camila">
          <h2>Vamos conversar sobre o seu negócio.</h2>
          <p className="lp-lead">Conte seu momento. A Camila ou a equipe Master Pet te chama no WhatsApp.</p>
          <div className="lp-panes">
            <div className="lp-fs" data-step="1" role="group" aria-label="Passo 1 de 3: contato">
              <Field id="f-nome" name="nome" label="Nome" autoComplete="name" placeholder="Seu nome" />
              <Field id="f-whatsapp" name="whatsapp" label="WhatsApp" type="tel" autoComplete="tel" inputMode="tel" placeholder="(00) 00000-0000" />
            </div>
            <div className="lp-fs" data-step="2" role="group" aria-label="Passo 2 de 3: seu negócio">
              <div className="lp-row">
                <Field id="f-cidade" name="cidade" label="Cidade/UF" autoComplete="address-level2" placeholder="Ex.: Lins/SP" />
                <Field id="f-negocio" name="negocio" label="Nome do negócio" placeholder="Nome do seu banho e tosa" />
              </div>
              <Group legend="Tempo de funcionamento" name="tempo" prov options={["Menos de 1 ano", "1 a 3 anos", "3 a 5 anos", "Mais de 5 anos"]} />
              <Group legend="Pessoas na equipe" name="equipe" prov options={["Só eu", "2 a 3", "4 ou mais"]} />
            </div>
            <div className="lp-fs" data-step="3" role="group" aria-label="Passo 3 de 3: seu momento">
              <Group legend="Maior desafio" name="desafio" prov options={["Organização e processos", "Precificação e financeiro", "Equipe", "Atendimento e clientes", "Tudo isso junto"]} />
              <Group legend="Já fez mentoria ou curso?" name="curso" options={["Sim", "Não"]} />
              <div className="mp-field">
                <label className="mp-field__label" htmlFor="f-msg">Mensagem<span className="mp-field__opt">(opcional)</span></label>
                <div className="mp-field__control mp-field__control--multi"><textarea id="f-msg" className="mp-field__input" name="mensagem" rows={2} /></div>
              </div>
              <div>
                <label className="lp-consent">
                  <input type="checkbox" id="consent" name="consentimento" />
                  <span>
                    Concordo em ser contatado(a) pelo WhatsApp e com o tratamento dos meus dados para esta finalidade, conforme a LGPD.{" "}
                    Veja a <Link href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer">Política de Privacidade</Link> e os <Link href="/termos-de-uso" target="_blank" rel="noopener noreferrer">Termos de Uso</Link>.
                  </span>
                </label>
              </div>
              <div className="lp-actions">
                <button type="button" className="mp-btn mp-btn--primary mp-btn--lg" disabled aria-describedby="lp-previa">
                  Quero conversar com a Camila<span className="mp-btn__arrow"><ArrowIcon /></span>
                </button>
              </div>
              <p id="lp-previa" className="lp-prov">prévia visual — o envio ainda não funciona</p>
            </div>
          </div>
          <div className="lp-success" role="status">
            <span className="ok"><CheckIcon size={28} /></span>
            <p><strong>Recebemos sua mensagem!</strong>A Camila ou a equipe Master Pet vai te chamar no WhatsApp para entender seu momento.</p>
            <BrandChip />
          </div>
        </form>
      </div>
    </section>
  );
}
