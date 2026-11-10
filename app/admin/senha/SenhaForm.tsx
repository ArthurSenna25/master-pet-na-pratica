"use client";
import { useActionState } from "react";
import { changePasswordAction, type SenhaState } from "../actions";
import { BOTAO, CAMPO } from "../ui";

const initial: SenhaState = {};

export function SenhaForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initial);
  return (
    <form action={action} className="grid gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <label className="grid gap-1 text-sm">Senha atual
        <input name="atual" type="password" autoComplete="current-password" required maxLength={200} className={CAMPO} />
      </label>
      <label className="grid gap-1 text-sm">Nova senha (12 a 200 caracteres)
        <input name="nova" type="password" autoComplete="new-password" required minLength={12} maxLength={200} className={CAMPO} />
      </label>
      <label className="grid gap-1 text-sm">Confirmar nova senha
        <input name="confirmacao" type="password" autoComplete="new-password" required maxLength={200} className={CAMPO} />
      </label>
      {state.error && <p role="alert" className="m-0 rounded-md bg-red-50 p-3 text-sm text-red-800">{state.error}</p>}
      <button type="submit" disabled={pending} className={`${BOTAO} !border-(--mp-navy-900) !bg-(--mp-navy-900) !text-(--mp-beige-50)`}>Salvar nova senha</button>
    </form>
  );
}
