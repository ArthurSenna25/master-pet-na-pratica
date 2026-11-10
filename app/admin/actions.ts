"use server";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { registrarAdminEvento } from "../_lib/admin/events";
import { ERRO_LOGIN, loginSchema } from "../_lib/admin/login-schema";
import { ERRO_SENHA_ATUAL, trocaSenhaSchema } from "../_lib/admin/senha-schema";
import { bloqueado, chaveLogin, chaveTrocaSenha, LOGIN, registrarFalha, TROCA_SENHA, zerar } from "../_lib/admin/tentativas";
import { auth } from "../_lib/auth";
import { getClientIp, ipHmac } from "../_lib/seguranca";
import { requireSession } from "../_lib/session";

export interface LoginState { error?: string }
export interface SenhaState { error?: string }

const ERRO_LIMITE = "Muitas tentativas. Aguarde um pouco.";

export async function loginAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { error: ERRO_LOGIN }; // mesma mensagem de credencial errada
  const h = await headers();
  // auth.api.* não passa pelo limitador do Better Auth (só o handler HTTP passa): limite próprio, por HMAC do IP.
  const ip = getClientIp(h);
  const chave = chaveLogin(ip ? ipHmac(ip) : null);
  if (await bloqueado(chave, LOGIN)) return { error: ERRO_LIMITE };
  try {
    await auth.api.signInEmail({ body: parsed.data, headers: h });
  } catch (e) {
    // sem e-mail/senha em log; só o status
    if (e instanceof APIError && e.statusCode === 429) return { error: ERRO_LIMITE };
    await registrarFalha(chave, LOGIN);
    return { error: ERRO_LOGIN };
  }
  await zerar(chave);
  await registrarAdminEvento("login");
  redirect("/admin");
}

export async function logoutAction() {
  await requireSession();
  await registrarAdminEvento("logout");
  await auth.api.signOut({ headers: await headers() });
  redirect("/admin/login");
}

/** Troca a senha do admin logado e encerra as outras sessões (a atual continua). Nada da senha vai a log, URL ou evento. */
export async function changePasswordAction(_prev: SenhaState, form: FormData): Promise<SenhaState> {
  const session = await requireSession();
  const parsed = trocaSenhaSchema.safeParse({ atual: form.get("atual"), nova: form.get("nova"), confirmacao: form.get("confirmacao") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? ERRO_SENHA_ATUAL };
  const chave = chaveTrocaSenha(session.user.id);
  if (await bloqueado(chave, TROCA_SENHA)) return { error: ERRO_LIMITE };
  try {
    await auth.api.changePassword({
      body: { currentPassword: parsed.data.atual, newPassword: parsed.data.nova, revokeOtherSessions: true },
      headers: await headers(),
    });
  } catch {
    // qualquer falha vira a mesma mensagem: não revela se foi a senha atual, o banco ou outra causa
    await registrarFalha(chave, TROCA_SENHA);
    return { error: ERRO_SENHA_ATUAL };
  }
  await zerar(chave);
  await registrarAdminEvento("troca_senha");
  redirect("/admin?ok=senha");
}
