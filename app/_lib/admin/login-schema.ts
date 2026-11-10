import { z } from "zod";

export const EMAIL_MAX = 254;
export const SENHA_MIN = 8; // o admin nasce com 12+ (create-admin.mjs); aqui só barra lixo antes de gastar o limite de 5/min
export const SENHA_MAX = 200;

/** Camada 2 do login (servidor). E-mail normalizado: trim + minúsculas. A senha NÃO é alterada. */
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(EMAIL_MAX).pipe(z.email()),
  password: z.string().min(SENHA_MIN).max(SENHA_MAX),
});

/** Mensagem única: não revela se o e-mail existe nem qual campo falhou. */
export const ERRO_LOGIN = "E-mail ou senha incorretos.";
