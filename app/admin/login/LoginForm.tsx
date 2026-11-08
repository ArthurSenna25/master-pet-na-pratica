"use client";
import { useActionState } from "react";
import { loginAction, type LoginState } from "../actions";

const initial: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <form action={action} style={{ display: "grid", gap: 16 }}>
      <label>E-mail<br /><input name="email" type="email" autoComplete="username" required style={{ width: "100%" }} /></label>
      <label>Senha<br /><input name="password" type="password" autoComplete="current-password" required style={{ width: "100%" }} /></label>
      {state.error && <p role="alert">{state.error}</p>}
      <button type="submit" disabled={pending}>Entrar</button>
    </form>
  );
}
