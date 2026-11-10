import { and, eq, like, lt, sql } from "drizzle-orm";
import { getDb } from "../db";
import { rateLimit } from "../db/schema";

// O limite do Better Auth só vale no handler HTTP; `auth.api.*` chamado de Server Action não passa por ele
// (medido: 8 logins errados => 8x 401). Este contador roda na tabela rate_limit_auth, com chaves próprias (prefixo `app:`).
// ponytail: checar (bloqueado) e registrar (registrarFalha) são dois passos; uma corrida deixa passar 1–2 tentativas a mais.
// O registro em si é um único INSERT ... ON CONFLICT DO UPDATE (atômico). Chave sem e-mail nem IP puro.

export const LOGIN = { max: 5, janelaMs: 60_000 } as const;
export const TROCA_SENHA = { max: 5, janelaMs: 10 * 60_000 } as const;
export const RETENCAO_MS = 24 * 60 * 60 * 1000; // linhas `app:` com mais de 24 h são apagadas a cada falha registrada

export const chaveLogin = (ipHmac: string | null) => `app:login:${ipHmac ?? "sem-ip"}`;
export const chaveTrocaSenha = (userId: string) => `app:senha:${userId}`;

/** true = já gastou as tentativas na janela atual. */
export async function bloqueado(chave: string, regra: { max: number; janelaMs: number }, agora = Date.now(), db = getDb()): Promise<boolean> {
  const [r] = await db.select({ count: rateLimit.count, desde: rateLimit.lastRequest }).from(rateLimit).where(eq(rateLimit.key, chave));
  return !!r && agora - r.desde <= regra.janelaMs && r.count >= regra.max;
}

/**
 * Conta 1 falha (upsert atômico). `lastRequest` guarda o INÍCIO da janela; passada a janela, recomeça em 1.
 * Na mesma transação (db.batch) apaga as linhas `app:` velhas: é a retenção definida para essas linhas.
 */
export async function registrarFalha(chave: string, regra: { janelaMs: number }, agora = Date.now(), db = getDb()): Promise<void> {
  await db.batch([
    db.delete(rateLimit).where(and(like(rateLimit.key, "app:%"), lt(rateLimit.lastRequest, agora - RETENCAO_MS))),
    db.insert(rateLimit).values({ id: crypto.randomUUID(), key: chave, count: 1, lastRequest: agora }).onConflictDoUpdate({
      target: rateLimit.key,
      set: {
        count: sql`case when ${agora} - ${rateLimit.lastRequest} > ${regra.janelaMs} then 1 else ${rateLimit.count} + 1 end`,
        lastRequest: sql`case when ${agora} - ${rateLimit.lastRequest} > ${regra.janelaMs} then ${agora} else ${rateLimit.lastRequest} end`,
      },
    }),
  ]);
}

/** Sucesso zera o contador. */
export async function zerar(chave: string, db = getDb()): Promise<void> {
  await db.delete(rateLimit).where(eq(rateLimit.key, chave));
}
