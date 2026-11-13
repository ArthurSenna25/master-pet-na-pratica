"use client";
import { useId, useState } from "react";
import { Icone } from "./Icone";

interface Props {
  name: string;
  rotulo: string;
  autoComplete: string;
  erro?: string;
  dica?: string;
  minLength?: number;
}

/** Campo de senha com erro e dica ligados por aria e botão mostrar/ocultar (aria-pressed; o nome acessível fica fixo). Sem JS o campo segue como password. */
export function CampoSenha({ name, rotulo, autoComplete, erro, dica, minLength }: Props) {
  const id = useId();
  const [visivel, setVisivel] = useState(false);
  const descr = [dica && `${id}-dica`, erro && `${id}-erro`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`ad-fld${erro ? " is-err" : ""}`}>
      <label htmlFor={id}>{rotulo}</label>
      <div className="ad-pw">
        <input id={id} name={name} type={visivel ? "text" : "password"} autoComplete={autoComplete} required minLength={minLength} maxLength={200}
          aria-invalid={erro ? true : undefined} aria-describedby={descr} spellCheck={false} autoCapitalize="none" />
        <button type="button" className="ad-pw__b" aria-pressed={visivel} aria-label={`Mostrar ${rotulo.toLowerCase()}`} onClick={() => setVisivel((v) => !v)}>
          <Icone nome={visivel ? "eye-off" : "eye"} /><span>Mostrar</span>
        </button>
      </div>
      {dica && <p id={`${id}-dica`} className="ad-hint2">{dica}</p>}
      {erro && <p id={`${id}-erro`} role="alert" className="ad-hint2"><Icone nome="alert" />{erro}</p>}
    </div>
  );
}
