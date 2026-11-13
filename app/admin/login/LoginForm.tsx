"use client";
import { useActionState } from "react";
import { loginAction, type LoginState } from "../actions";
import { Aviso } from "../Aviso";
import { Campo } from "../Campo";
import { CampoSenha } from "../CampoSenha";

const initial: LoginState = {};

export function LoginForm({ okSenha }: { okSenha: boolean }) {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <form action={action} className="ad-lg" aria-labelledby="lg-h">
      <p className="ad-eyebrow">Acesso restrito</p>
      <h1 id="lg-h">Entrar no painel</h1>
      {okSenha && <Aviso tipo="ok" entrada>Senha alterada. Entre com a nova senha.</Aviso>}
      {state.error && <Aviso tipo="erro">{state.error}</Aviso>}
      <Campo id="lg-email" rotulo="E-mail" name="email" type="email" autoComplete="username" required maxLength={254} />
      <CampoSenha name="password" rotulo="Senha" autoComplete="current-password" />
      <button type="submit" className="ad-btn ad-btn--primary ad-btn--lg ad-btn--block" aria-disabled={pending || undefined}
        onClick={(e) => { if (pending) e.preventDefault(); }}>{pending ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}
