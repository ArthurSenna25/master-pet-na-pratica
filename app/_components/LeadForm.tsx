"use client";
// F4: formulário em 3 passos. SSR mostra os 3 passos juntos e o envio funciona sem JS (server action + permalink);
// depois da hidratação (`js`) vira passo a passo. Validação de verdade: Zod no servidor (enviarLead).
import Image from "next/image";
import Link from "next/link";
import { Fragment, useActionState, useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { entrarPasso, reduzido, sairPasso, sucesso } from "../_fx/form";
import { consentParts } from "../_lib/consent";
import { enviarLead, type LeadState } from "../_lib/lead-action";
import { JA_FEZ_MENTORIA, MAIOR_DESAFIO, PESSOAS, TEMPO_FUNCIONAMENTO } from "../_lib/lead-options";
import type { LeadField } from "../_lib/lead-schema";
import { BrandChip } from "./BrandChip";
import { ArrowIcon, CheckIcon } from "./icons";
import { CAMPOS_POR_PASSO, NOMES_DOS_PASSOS, passoDoCampo, validarPassos } from "./lead-form-check";

type Erros = Partial<Record<LeadField, string>>;
const INICIAL: LeadState = {};
const ORDEM = CAMPOS_POR_PASSO.flat();
const ULTIMO = CAMPOS_POR_PASSO.length - 1;
const semAssinatura = () => () => {};

function AlertIcon() {
  return (
    <svg className="mp-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

interface FieldProps {
  id: string;
  name: LeadField;
  label: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "tel";
  defaultValue?: string;
  error?: string;
}

function Field({ id, name, label, type = "text", error, defaultValue, ...rest }: FieldProps) {
  return (
    <div className={`mp-field${error ? " mp-field--error" : ""}`}>
      <label className="mp-field__label" htmlFor={id}>{label}</label>
      <div className="mp-field__control">
        <input
          id={id} className="mp-field__input" name={name} type={type} required defaultValue={defaultValue}
          aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-err` : undefined} {...rest}
        />
      </div>
      {error && <div className="mp-field__hint" id={`${id}-err`} role="alert"><AlertIcon /><span>{error}</span></div>}
    </div>
  );
}

interface GroupProps {
  legend: string;
  name: LeadField;
  options: readonly string[];
  prov?: boolean;
  checked?: string;
  error?: string;
}

function Group({ legend, name, options, prov, checked, error }: GroupProps) {
  return (
    <fieldset className="lp-group" data-choice="" aria-describedby={error ? `${name}-err` : undefined}>
      <legend>{legend}{prov && <span className="lp-prov">opções provisórias</span>}</legend>
      <div className="lp-choices">
        {options.map((o) => (
          <label className="lp-choice" key={o}><input type="radio" name={name} value={o} required defaultChecked={checked === o} /><span>{o}</span></label>
        ))}
      </div>
      {error && <p className="lp-gmsg" id={`${name}-err`} role="alert">{error}</p>}
    </fieldset>
  );
}

export function LeadForm() {
  const [state, action, pending] = useActionState(enviarLead, INICIAL, "/#conversar");
  const js = useSyncExternalStore(semAssinatura, () => true, () => false); // false no SSR/hidratação, true depois
  const [step, setStep] = useState(0);
  const [local, setLocal] = useState<Erros>({}); // "" = erro dispensado (campo editado)
  const [vista, setVista] = useState(state);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLParagraphElement>(null);
  const ocupado = useRef(false);
  const entrada = useRef<{ dir: 1 | -1; anima: boolean } | null>(null);
  const foco = useRef<LeadField | null>(null);

  // Resultado novo do servidor: zera erros locais e abre o passo do 1º campo inválido (ajuste durante o render).
  if (vista !== state) {
    setVista(state);
    setLocal({});
    const primeiro = ORDEM.find((c) => state.errors?.[c]);
    if (primeiro) setStep(passoDoCampo(primeiro));
  }

  const erro = (c: LeadField): string | undefined => (c in local ? local[c] : state.errors?.[c]) || undefined;
  const v = state.values ?? {};
  const panes = () => Array.from(formRef.current?.querySelectorAll<HTMLElement>(".lp-fs") ?? []);
  const focar = (c: LeadField) => formRef.current?.querySelector<HTMLElement>(`[name="${c}"]`)?.focus();

  // Foco depois do resultado do servidor: sucesso, 1º campo inválido ou mensagem geral.
  useEffect(() => {
    if (state === INICIAL) return;
    if (state.ok) {
      const s = successRef.current;
      if (s) { s.focus(); sucesso(s); }
      return;
    }
    const primeiro = ORDEM.find((c) => state.errors?.[c]);
    if (primeiro) focar(primeiro);
    else if (state.message) msgRef.current?.focus();
  }, [state]);

  // Foco no campo inválido pedido por Continuar/enviar (o passo já está visível neste commit).
  useEffect(() => {
    if (foco.current) { focar(foco.current); foco.current = null; }
  });

  // Troca de passo: entrada de 350 ms + foco no 1º campo do passo.
  useEffect(() => {
    const e = entrada.current;
    if (!e) return;
    entrada.current = null;
    const pane = panes()[step];
    pane?.querySelector<HTMLElement>("input,textarea")?.focus({ preventScroll: true });
    ocupado.current = false; // só a saída (140 ms) bloqueia cliques; a entrada pode ser interrompida
    if (pane && e.anima) void entrarPasso(pane, e.dir);
  }, [step]);

  async function ir(n: number) {
    if (n === step || n < 0 || n > ULTIMO || ocupado.current) return;
    const dir = n > step ? 1 : -1;
    const r = formRef.current?.getBoundingClientRect();
    if (r && r.top < 82) scrollTo({ top: r.top + scrollY - 96, behavior: reduzido() ? "auto" : "smooth" });
    ocupado.current = true;
    const anima = !reduzido();
    if (anima) await sairPasso(panes()[step], dir);
    entrada.current = { dir, anima };
    setStep(n);
  }

  function mostrar(erros: Erros, passos: number[]) {
    const zerado = Object.fromEntries(passos.flatMap((p) => CAMPOS_POR_PASSO[p]).map((c) => [c, erros[c] ?? ""]));
    setLocal((p) => ({ ...p, ...zerado }));
    const primeiro = ORDEM.find((c) => erros[c]);
    if (!primeiro) return false;
    const alvo = passoDoCampo(primeiro);
    foco.current = primeiro;
    if (alvo !== step) setStep(alvo); // sem animação: erro precisa de resposta imediata
    return true;
  }

  function aoEnviar(e: FormEvent<HTMLFormElement>) {
    if (!js) return; // sem JS o navegador/servidor cuidam de tudo
    const fd = new FormData(e.currentTarget);
    if (step < ULTIMO) {
      e.preventDefault();
      if (!mostrar(validarPassos([step], fd), [step])) void ir(step + 1);
      return;
    }
    const todos = CAMPOS_POR_PASSO.map((_, i) => i);
    if (mostrar(validarPassos(todos, fd), todos)) e.preventDefault();
  }

  const limpar = (e: FormEvent<HTMLFormElement>) => {
    const n = (e.target as HTMLInputElement).name as LeadField;
    if (n) setLocal((p) => (p[n] === "" ? p : { ...p, [n]: "" }));
  };

  const pane = (i: number) => ({ "data-step": i + 1, hidden: js && step !== i });
  const actions = (i: number) => (
    <div className="lp-actions">
      {i > 0 && <button type="button" className="lp-back" onClick={() => void ir(i - 1)}>Voltar</button>}
      {i < ULTIMO ? (
        <button type="button" className="mp-btn mp-btn--primary mp-btn--lg" data-next="" onClick={(e) => e.currentTarget.form?.requestSubmit()}>
          Continuar<span className="mp-btn__arrow"><ArrowIcon /></span>
        </button>
      ) : (
        <button type="submit" className="mp-btn mp-btn--primary mp-btn--lg" disabled={pending} aria-describedby="lp-demo">
          {pending ? "Enviando…" : "Quero conversar com a Camila"}<span className="mp-btn__arrow"><ArrowIcon /></span>
        </button>
      )}
    </div>
  );

  return (
    <section className="lp-sec lp-end" id="conversar" data-screen-label="10 Formulário">
      <div className="lp-end__photo" aria-hidden="true">
        <Image src="/images/camila-cta-900.webp" alt="" width={900} height={1125} sizes="(min-width: 900px) 66vw, 100vw" />
        <i className="lp-end__mul" /><i className="lp-end__lift" />
      </div>
      <div className="lp-end__scrim" aria-hidden="true" />
      <div className="mp-fx mp-fx--light-gold" /><div className="mp-fx mp-fx--grain" /><div className="mp-fx mp-fx--vignette" />
      <div className="lp-wrap lp-end__grid">
        <form
          ref={formRef} action={action} onSubmit={aoEnviar} onInput={limpar} noValidate={js} aria-busy={pending}
          className={`lp-form lp-glass${js ? " is-steps" : ""}${state.ok ? " is-done" : ""}`} id="lp-form" aria-label="Quero conversar com a Camila"
        >
          <h2>Vamos conversar sobre o seu negócio.</h2>
          <p className="lp-lead">Conte seu momento. A Camila ou a equipe Master Pet te chama no WhatsApp.</p>
          <p className="lp-prov lp-demo" id="lp-demo">demonstração: use dados fictícios</p>
          <p className="lp-prog__t" aria-live="polite" aria-atomic="true">Passo <b>{step + 1}</b> de {CAMPOS_POR_PASSO.length} · {NOMES_DOS_PASSOS[step]}</p>
          <div className="lp-hp" aria-hidden="true" inert>
            <label>Não preencha este campo<input type="text" name="site" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
          </div>
          <div className="lp-panes">
            <div className="lp-fs" role="group" aria-label="Passo 1 de 3: contato" {...pane(0)}>
              <Field id="f-nome" name="nome" label="Nome" autoComplete="name" placeholder="Seu nome" defaultValue={v.nome} error={erro("nome")} />
              <Field id="f-whatsapp" name="whatsapp" label="WhatsApp" type="tel" autoComplete="tel" inputMode="tel" placeholder="(00) 00000-0000" defaultValue={v.whatsapp} error={erro("whatsapp")} />
              {actions(0)}
            </div>
            <div className="lp-fs" role="group" aria-label="Passo 2 de 3: seu negócio" {...pane(1)}>
              <div className="lp-row">
                <Field id="f-cidade" name="cidade" label="Cidade/UF" autoComplete="address-level2" placeholder="Ex.: Lins/SP" defaultValue={v.cidade} error={erro("cidade")} />
                <Field id="f-negocio" name="negocio" label="Nome do negócio" placeholder="Nome do seu banho e tosa" defaultValue={v.negocio} error={erro("negocio")} />
              </div>
              <Group legend="Tempo de funcionamento" name="tempo" prov options={TEMPO_FUNCIONAMENTO} checked={v.tempo} error={erro("tempo")} />
              <Group legend="Pessoas na equipe" name="equipe" prov options={PESSOAS} checked={v.equipe} error={erro("equipe")} />
              {actions(1)}
            </div>
            <div className="lp-fs" role="group" aria-label="Passo 3 de 3: seu momento" {...pane(2)}>
              <Group legend="Maior desafio" name="desafio" prov options={MAIOR_DESAFIO} checked={v.desafio} error={erro("desafio")} />
              <Group legend="Já fez mentoria ou curso?" name="curso" options={JA_FEZ_MENTORIA} checked={v.curso} error={erro("curso")} />
              <div className="mp-field">
                <label className="mp-field__label" htmlFor="f-msg">Mensagem<span className="mp-field__opt">(opcional)</span></label>
                <div className="mp-field__control mp-field__control--multi"><textarea id="f-msg" className="mp-field__input" name="mensagem" rows={2} maxLength={1000} defaultValue={v.mensagem} /></div>
              </div>
              <div>
                <label className="lp-consent">
                  <input type="checkbox" id="consent" name="consentimento" required aria-describedby={erro("consentimento") ? "consent-err" : undefined} />
                  <span>
                    {consentParts().map((p, i) => (
                      <Fragment key={i}>
                        {p.href ? <Link href={p.href} target="_blank" rel="noopener noreferrer">{p.text}</Link> : p.text}
                      </Fragment>
                    ))}
                  </span>
                </label>
                {erro("consentimento") && <p className="lp-cmsg" id="consent-err" role="alert">{erro("consentimento")}</p>}
              </div>
              {state.message && <p className="lp-formmsg" role="alert" tabIndex={-1} ref={msgRef}>{state.message}</p>}
              {actions(2)}
            </div>
          </div>
          <div className="lp-success" role="status" tabIndex={-1} ref={successRef}>
            <span className="ok"><CheckIcon size={28} /></span>
            <p><strong>Recebemos sua mensagem!</strong>A Camila ou a equipe Master Pet vai te chamar no WhatsApp para entender seu momento.</p>
            <BrandChip />
          </div>
        </form>
      </div>
    </section>
  );
}
