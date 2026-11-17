"use client";

import { useActionState, useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { ConsentLabel } from "../_components/ConsentLabel";
import { enviarLeadMentoria, type LeadState } from "../_lib/lead-action";
import { checarCidadeUf, checarNegocio, checarNome, checarWhatsapp, formatarTelefone } from "../_lib/lead-rules";
import { EVENTO_DESAFIO } from "./Diagnostico";

// Pré-inscrição da mentoria em 2 passos (handoff v4). Funciona sem JS: SSR mostra os dois passos juntos e o envio é a Server Action
// (enviarLeadMentoria; a campanha é fixada no servidor). Com JS vira passo a passo. Validação de verdade: Zod no servidor.
type Erros = Record<string, string | undefined>;
const INICIAL: LeadState = {};
const OBRIGATORIA = "Escolha uma opção.";

const TEMPO = [["menos-1", "Menos de 1 ano"], ["1-3", "1 a 3 anos"], ["3-5", "3 a 5 anos"], ["mais-5", "Mais de 5 anos"]] as const;
const EQUIPE = [["so-eu", "Só eu"], ["2-3", "2 a 3"], ["4-mais", "4 ou mais"]] as const;
const DESAFIO = [["processos", "Organização e processos"], ["preco", "Precificação"], ["equipe", "Equipe"], ["atendimento", "Atendimento"], ["tudo", "Tudo junto"]] as const;

const assinarNada = () => () => {};
const texto = (fd: FormData, k: string) => (typeof fd.get(k) === "string" ? String(fd.get(k)) : "");

function validarPasso1(fd: FormData): Erros {
  const e: Erros = {};
  const n = checarNome(texto(fd, "nome")); if (!n.ok) e.nome = n.erro;
  const w = checarWhatsapp(texto(fd, "whatsapp")); if (!w.ok) e.whatsapp = w.erro;
  return e;
}

function validarPasso2(fd: FormData): Erros {
  const e: Erros = {};
  const c = checarCidadeUf(texto(fd, "cidade")); if (!c.ok) e.cidade = c.erro;
  const n = checarNegocio(texto(fd, "negocio")); if (!n.ok) e.negocio = n.erro;
  for (const k of ["tempo", "equipe", "desafio"]) if (!texto(fd, k)) e[k] = OBRIGATORIA;
  if (fd.get("consentimento") !== "on") e.consentimento = "Para entrar na lista, marque o consentimento.";
  return e;
}

const Alerta = () => <svg className="nm-ico" aria-hidden="true" focusable="false"><use href="#nm-alert" /></svg>;
const Msg = ({ id, erro }: { id: string; erro?: string }) => <p className="nm-msg" id={id} aria-live="polite"><Alerta /><span>{erro}</span></p>;

interface CampoProps {
  id: string; nome: string; rotulo: string; auto: string; max: number; ph: string; tipo?: string; modo?: "tel";
  valor?: string; erro?: string; aoDigitar?: (e: FormEvent<HTMLInputElement>) => void;
}
function Campo({ id, nome, rotulo, auto, max, ph, tipo = "text", modo, valor, erro, aoDigitar }: CampoProps) {
  return (
    <div className="nm-field" data-nm-f data-state={erro ? "invalid" : undefined}>
      <label htmlFor={id}>{rotulo}</label>
      <input
        className="nm-input" id={id} name={nome} type={tipo} inputMode={modo} autoComplete={auto} maxLength={max} required placeholder={ph}
        defaultValue={valor} aria-invalid={erro ? true : undefined} aria-describedby={`e-${id}`} onInput={aoDigitar}
      />
      <Msg id={`e-${id}`} erro={erro} />
    </div>
  );
}

interface GrupoProps {
  nome: string; legenda: string; opcoes: readonly (readonly [string, string])[]; marcado?: string; erro?: string; aviso?: React.ReactNode;
  aoMudar?: () => void;
}
function Grupo({ nome, legenda, opcoes, marcado, erro, aviso, aoMudar }: GrupoProps) {
  return (
    <fieldset className="nm-group" data-nm-f data-state={erro ? "invalid" : undefined}>
      <legend>{legenda} <span className="nm-seal">opções provisórias</span></legend>
      {aviso}
      <div className="nm-choices">
        {opcoes.map(([valor, rotulo], i) => (
          <label className="nm-choice" key={valor}>
            <input type="radio" name={nome} value={valor} required={i === 0} defaultChecked={marcado === valor} aria-describedby={i === 0 ? `e-${nome}` : undefined} onChange={aoMudar} />
            <span>{rotulo}</span>
          </label>
        ))}
      </div>
      <Msg id={`e-${nome}`} erro={erro} />
    </fieldset>
  );
}

export function FormMentoria() {
  const [state, action, pending] = useActionState(enviarLeadMentoria, INICIAL, "/mentoria#lista");
  const js = useSyncExternalStore(assinarNada, () => true, () => false);
  // ?origem= (campo oculto): lido do endereço depois da hidratação; o servidor valida e descarta o que não for um rótulo curto.
  const origem = useSyncExternalStore(assinarNada, () => new URLSearchParams(window.location.search).get("origem")?.slice(0, 60) ?? "", () => "");
  const [passo, setPasso] = useState(1);
  const [erroCli, setErroCli] = useState<Erros>({});
  const [preSel, setPreSel] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const okRef = useRef<HTMLHeadingElement>(null);
  const enviando = useRef(false); // trava síncrona: `disabled` só vale após o re-render e o React enfileira ações; sem isto, 2 cliques = 2 leads
  const v = state.values ?? {};
  const ok = state.ok === true;
  const erros: Erros = { ...state.errors, ...erroCli };
  const erroPasso1 = Boolean(state.errors?.nome || state.errors?.whatsapp);

  // Diagnóstico "Onde o seu dia trava?": pré-seleciona o maior desafio (só no cliente; nada é enviado antes do envio do formulário).
  useEffect(() => {
    const aoEscolher = (e: Event) => {
      const d = (e as CustomEvent<{ desafio: string }>).detail?.desafio;
      const r = formRef.current?.querySelector<HTMLInputElement>(`input[name="desafio"][value="${d}"]`);
      if (!r) return;
      r.checked = true;
      setPreSel(true);
      setErroCli((c) => ({ ...c, desafio: "" }));
    };
    window.addEventListener(EVENTO_DESAFIO, aoEscolher);
    return () => window.removeEventListener(EVENTO_DESAFIO, aoEscolher);
  }, []);

  useEffect(() => { if (ok) okRef.current?.focus(); }, [ok]);
  useEffect(() => { if (!pending) enviando.current = false; }, [pending, state]); // state muda a cada resposta: libera mesmo se o React não chegou a renderizar pending=true

  const mostrarPasso1 = !js || passo === 1 || erroPasso1;
  const mostrarPasso2 = !js || (passo === 2 && !erroPasso1);

  const focar = (nome: string) => formRef.current?.querySelector<HTMLElement>(`[name="${nome}"]`)?.focus();
  const limpar = (nome: string) => erroCli[nome] && setErroCli((c) => ({ ...c, [nome]: "" }));

  const continuar = (fd: FormData) => {
    const e = validarPasso1(fd);
    setErroCli(e);
    const primeiro = Object.keys(e)[0];
    if (primeiro) { focar(primeiro); return; }
    setPasso(2);
    setTimeout(() => focar("cidade"), 0);
  };

  const aoEnviar = (ev: FormEvent<HTMLFormElement>) => {
    if (enviando.current) { ev.preventDefault(); return; }
    if (!js) return;
    const fd = new FormData(ev.currentTarget);
    if (passo === 1 && !erroPasso1) { ev.preventDefault(); continuar(fd); return; }
    const e = validarPasso2(fd);
    setErroCli(e);
    const primeiro = Object.keys(e).find((k) => e[k]);
    if (primeiro) { ev.preventDefault(); focar(primeiro); return; }
    enviando.current = true;
  };

  const mascara = (ev: FormEvent<HTMLInputElement>) => { ev.currentTarget.value = formatarTelefone(ev.currentTarget.value); limpar("whatsapp"); };

  return (
    <form
      ref={formRef} className={js ? "nm-form is-js" : "nm-form"} id="nm-form" action={action} onSubmit={aoEnviar} noValidate={js}
      aria-labelledby="h-form" aria-busy={pending} data-step={passo} data-state={ok ? "ok" : pending ? "sending" : undefined}
    >
      <div className="nm-form__head"><h3 id="h-form">Entrar na lista da turma</h3></div>
      <p className="nm-demo-warn"><Alerta /><span>demonstração: use dados fictícios</span></p>
      <div className="nm-prog">
        <ol className="nm-sr"><li aria-current={passo === 1 ? "step" : undefined}>Passo 1: contato</li><li aria-current={passo === 2 ? "step" : undefined}>Passo 2: seu negócio</li></ol>
        <div className="nm-prog__bar" aria-hidden="true"><i></i></div>
        <p className="nm-prog__t" aria-live="polite">Passo <b>{passo}</b> de 2 · {passo === 1 ? "Contato" : "Seu negócio"}</p>
      </div>
      <div className="nm-hp" aria-hidden="true"><label htmlFor="f-site">Não preencha este campo</label><input id="f-site" name="site" type="text" tabIndex={-1} autoComplete="off" defaultValue="" /></div>
      <input type="hidden" name="origem_campanha" value={origem} />

      <fieldset className="nm-pane" data-step="1" hidden={!mostrarPasso1}>
        <legend className="nm-sr">Passo 1 de 2: contato</legend>
        <Campo id="f-nome" nome="nome" rotulo="Nome" auto="name" max={80} ph="Como podemos te chamar" valor={v.nome} erro={erros.nome} aoDigitar={() => limpar("nome")} />
        <Campo id="f-whatsapp" nome="whatsapp" rotulo="WhatsApp" auto="tel-national" max={16} ph="(00) 00000-0000" tipo="tel" modo="tel" valor={v.whatsapp} erro={erros.whatsapp} aoDigitar={mascara} />
        <div className="nm-actions">
          <button type="button" className="nm-btn" data-nm-next onClick={() => formRef.current && continuar(new FormData(formRef.current))}>
            <span>Continuar</span>
            <svg className="nm-ico" aria-hidden="true" focusable="false"><use href="#nm-arrow" /></svg>
          </button>
        </div>
        <p className="nm-micro">Gratuito. Você só recebe o aviso da abertura.</p>
      </fieldset>

      <fieldset className="nm-pane" data-step="2" hidden={!mostrarPasso2}>
        <legend className="nm-sr">Passo 2 de 2: seu negócio</legend>
        <div className="nm-row2">
          <Campo id="f-cidade" nome="cidade" rotulo="Cidade/UF" auto="address-level2" max={64} ph="Ex.: Lins/SP" valor={v.cidade} erro={erros.cidade} aoDigitar={() => limpar("cidade")} />
          <Campo id="f-negocio" nome="negocio" rotulo="Nome do negócio" auto="organization" max={80} ph="Seu banho e tosa" valor={v.negocio} erro={erros.negocio} aoDigitar={() => limpar("negocio")} />
        </div>
        <Grupo nome="tempo" legenda="Tempo de funcionamento" opcoes={TEMPO} marcado={v.tempo} erro={erros.tempo} aoMudar={() => limpar("tempo")} />
        <Grupo nome="equipe" legenda="Pessoas na equipe" opcoes={EQUIPE} marcado={v.equipe} erro={erros.equipe} aoMudar={() => limpar("equipe")} />
        <Grupo
          nome="desafio" legenda="Maior desafio hoje" opcoes={DESAFIO} marcado={v.desafio} erro={erros.desafio}
          aviso={<p className="nm-prefill" hidden={!preSel}>Pré-selecionado pela sua escolha em “Onde o seu dia trava?”. Você pode mudar.</p>}
          aoMudar={() => { setPreSel(false); limpar("desafio"); }}
        />
        <div data-nm-f data-state={erros.consentimento ? "invalid" : undefined}>
          <div className="nm-consent">
            <input type="checkbox" id="f-consent" name="consentimento" required aria-invalid={erros.consentimento ? true : undefined} aria-describedby="e-consent" onChange={() => limpar("consentimento")} />
            <label htmlFor="f-consent"><ConsentLabel campanha="mentoria" /></label>
          </div>
          <Msg id="e-consent" erro={erros.consentimento} />
        </div>
        {state.message && <p className="nm-form__erro" role="alert">{state.message}</p>}
        <p className="nm-demo-warn"><Alerta /><span>demonstração: use dados fictícios</span></p>
        <div className="nm-actions">
          <button type="button" className="nm-ghost" data-nm-back onClick={() => { setErroCli({}); setPasso(1); }}>Voltar</button>
          <button type="submit" className="nm-btn" disabled={pending}>
            <span>Entrar na lista da turma</span>
            <span className="nm-dots" aria-hidden="true"><i></i><i></i><i></i></span>
          </button>
        </div>
        <p className="nm-micro">Gratuito. Você só recebe o aviso da abertura.</p>
      </fieldset>

      <div className="nm-ok" role="status">
        <span className="nm-ok__ico" aria-hidden="true"><svg className="nm-ico" aria-hidden="true" focusable="false"><use href="#nm-check" /></svg></span>
        <h3 ref={okRef} tabIndex={-1} data-nm-ok-h>Pronto, você está na lista!</h3>
        <p>Obrigada por se inscrever. Seu nome já está na lista da turma da Mentoria Master Pet.</p>
        <div className="nm-next">
          <strong>O que acontece agora</strong>
          <ul>
            <li><svg className="nm-ico" aria-hidden="true" focusable="false"><use href="#nm-check" /></svg><span>Quando a turma abrir, a Camila ou a equipe chama você no WhatsApp, individualmente.</span></li>
            <li><svg className="nm-ico" aria-hidden="true" focusable="false"><use href="#nm-check" /></svg><span>Você não paga nada para estar na lista.</span></li>
            <li><svg className="nm-ico" aria-hidden="true" focusable="false"><use href="#nm-check" /></svg><span>Se mudar de ideia, é só pedir para sair.</span></li>
          </ul>
        </div>
        <div className="nm-optgroup">
          <strong>Quer entrar no grupo da mentoria?</strong>
          <p className="nm-muted">Opcional. Ninguém é adicionado sem pedir.</p>
          <a href="#grupo-placeholder" data-placeholder>Quero entrar no grupo <span className="nm-seal nm-seal--ex">link a receber</span></a>
        </div>
      </div>
    </form>
  );
}
