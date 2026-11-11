"use client";
import { useActionState } from "react";
import { loginAction, type LoginState } from "../actions";
import { BOTAO_PRIMARIO, CAMPO } from "../ui";

const initial: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-1 text-sm">E-mail
        <input name="email" type="email" autoComplete="username" required maxLength={254} className={`${CAMPO} box-border w-full`} />
      </label>
      <label className="grid gap-1 text-sm">Senha
        <input name="password" type="password" autoComplete="current-password" required maxLength={200} className={`${CAMPO} box-border w-full`} />
      </label>
      {state.error && <p role="alert" className="m-0 rounded-md bg-(--mp-danger-bg) p-3 text-sm text-(--mp-danger)">{state.error}</p>}
      <button type="submit" disabled={pending} className={BOTAO_PRIMARIO}>{pending ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}
