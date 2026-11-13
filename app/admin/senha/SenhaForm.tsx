"use client";
import Link from "next/link";
import { useActionState } from "react";
import { changePasswordAction, type SenhaState } from "../actions";
import { CampoSenha } from "../CampoSenha";

const initial: SenhaState = {};

export function SenhaForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initial);
  const e = state.errors ?? {};
  return (
    <form action={action} className="ad-stack">
      <CampoSenha name="atual" rotulo="Senha atual" autoComplete="current-password" erro={e.atual} />
      <CampoSenha name="nova" rotulo="Nova senha" autoComplete="new-password" minLength={12} dica="Mínimo de 12 caracteres." erro={e.nova} />
      <CampoSenha name="confirmacao" rotulo="Confirmar nova senha" autoComplete="new-password" erro={e.confirmacao} />
      <div className="ad-row">
        <button type="submit" className="ad-btn ad-btn--primary" aria-disabled={pending || undefined}
          onClick={(ev) => { if (pending) ev.preventDefault(); }}>{pending ? "Salvando…" : "Salvar nova senha"}</button>
        <Link className="ad-btn ad-btn--secondary" href="/admin" prefetch={false}>Cancelar</Link>
      </div>
    </form>
  );
}
