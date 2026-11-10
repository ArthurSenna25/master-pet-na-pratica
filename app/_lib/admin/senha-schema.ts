import { z } from "zod";
import { SENHA_MAX } from "./login-schema";

export const NOVA_SENHA_MIN = 12; // mesmo mínimo do create-admin.mjs

export const ERRO_SENHA_ATUAL = "Senha atual incorreta.";
export const ERRO_SENHA_CURTA = `A nova senha precisa ter de ${NOVA_SENHA_MIN} a ${SENHA_MAX} caracteres.`;
export const ERRO_SENHA_IGUAL = "A nova senha precisa ser diferente da atual.";
export const ERRO_SENHA_CONFIRMACAO = "A confirmação não é igual à nova senha.";

/** Camada 2 (servidor). Mensagens fixas: nenhuma devolve o que foi digitado. */
export const trocaSenhaSchema = z
  .object({
    atual: z.string().min(1, ERRO_SENHA_ATUAL).max(SENHA_MAX, ERRO_SENHA_ATUAL),
    nova: z.string().min(NOVA_SENHA_MIN, ERRO_SENHA_CURTA).max(SENHA_MAX, ERRO_SENHA_CURTA),
    confirmacao: z.string().max(SENHA_MAX, ERRO_SENHA_CONFIRMACAO),
  })
  .refine((d) => d.nova !== d.atual, { path: ["nova"], message: ERRO_SENHA_IGUAL })
  .refine((d) => d.nova === d.confirmacao, { path: ["confirmacao"], message: ERRO_SENHA_CONFIRMACAO });
