"use server";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { registrarAdminEvento } from "../_lib/admin/events";
import { auth } from "../_lib/auth";
import { requireSession } from "../_lib/session";

const loginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(200),
});

export interface LoginState { error?: string }

export async function loginAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { error: "Informe e-mail e senha válidos." };
  try {
    await auth.api.signInEmail({ body: parsed.data, headers: await headers() });
  } catch (e) {
    // sem e-mail/senha em log; só o status
    if (e instanceof APIError && e.statusCode === 429) return { error: "Muitas tentativas. Aguarde um minuto." };
    return { error: "E-mail ou senha incorretos." };
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
