"use client";
import { useActionState } from "react";
import { changePasswordAction, type SenhaState } from "../actions";
import { CampoSenha } from "../CampoSenha";
import { BOTAO_PRIMARIO } from "../ui";

const initial: SenhaState = {};

export function SenhaForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initial);
  const e = state.errors ?? {};
  return (
    <form action={action} className="grid gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <CampoSenha name="atual" rotulo="Senha atual" autoComplete="current-password" erro={e.atual} />
      <CampoSenha name="nova" rotulo="Nova senha" autoComplete="new-password" minLength={12} dica="Mínimo de 12 caracteres." erro={e.nova} />
      <CampoSenha name="confirmacao" rotulo="Confirmar nova senha" autoComplete="new-password" erro={e.confirmacao} />
      <button type="submit" disabled={pending} className={BOTAO_PRIMARIO}>{pending ? "Salvando…" : "Salvar nova senha"}</button>
    </form>
  );
}
