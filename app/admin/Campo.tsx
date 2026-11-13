import type { InputHTMLAttributes } from "react";

/** Campo de texto do painel (.ad-fld): label visível ligada por for/id. */
export function Campo({ id, rotulo, ...input }: { id: string; rotulo: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="ad-fld">
      <label htmlFor={id}>{rotulo}</label>
      <input id={id} {...input} />
    </div>
  );
}
