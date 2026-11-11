"use client";
import { useId, useState } from "react";
import { CAMPO, FOCO, IconeOlho } from "./ui";

interface Props {
  name: string;
  rotulo: string;
  autoComplete: string;
  erro?: string;
  dica?: string;
  minLength?: number;
}

/** Campo de senha com erro e dica ligados por aria e botão mostrar/ocultar (aria-pressed). Sem JS o campo segue como password. */
export function CampoSenha({ name, rotulo, autoComplete, erro, dica, minLength }: Props) {
  const id = useId();
  const [visivel, setVisivel] = useState(false);
  const descr = [dica && `${id}-dica`, erro && `${id}-erro`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="grid gap-1 text-sm">
      <label htmlFor={id}>{rotulo}</label>
      <div className="relative">
        <input id={id} name={name} type={visivel ? "text" : "password"} autoComplete={autoComplete} required minLength={minLength} maxLength={200}
          aria-invalid={erro ? true : undefined} aria-describedby={descr} spellCheck={false} autoCapitalize="none"
          className={`${CAMPO} box-border w-full pr-12 ${erro ? "!border-(--mp-danger)" : ""}`} />
        <button type="button" aria-pressed={visivel} aria-label={`Mostrar ${rotulo.toLowerCase()}`} onClick={() => setVisivel((v) => !v)}
          className={`absolute right-0 top-0 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-slate-700 hover:text-blue-700 aria-pressed:text-blue-700 aria-pressed:[&_svg]:[stroke-width:3] ${FOCO}`}>
          <IconeOlho />
        </button>
      </div>
      {dica && <p id={`${id}-dica`} className="m-0 text-(--mp-ink-muted)">{dica}</p>}
      {erro && <p id={`${id}-erro`} role="alert" className="m-0 text-(--mp-danger)">{erro}</p>}
    </div>
  );
}
