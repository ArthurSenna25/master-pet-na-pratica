"use server";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { registrarAdminEvento } from "../_lib/admin/events";
import { ERRO_LOGIN, loginSchema } from "../_lib/admin/login-schema";
import { auth } from "../_lib/auth";
import { requireSession } from "../_lib/session";

export interface LoginState { error?: string }

export async function loginAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { error: ERRO_LOGIN }; // mesma mensagem de credencial errada
  try {
    await auth.api.signInEmail({ body: parsed.data, headers: await headers() });
  } catch (e) {
    // sem e-mail/senha em log; só o status
    if (e instanceof APIError && e.statusCode === 429) return { error: "Muitas tentativas. Aguarde um minuto." };
    return { error: ERRO_LOGIN };
  }
  await registrarAdminEvento("login");
  redirect("/admin");
}

export async function logoutAction() {
  await requireSession();
  await registrarAdminEvento("logout");
  await auth.api.signOut({ headers: await headers() });
  redirect("/admin/login");
}
