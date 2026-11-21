import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getDb } from "./db";
import * as schema from "./db/schema";

// Login único: cadastro público DESLIGADO (o admin nasce em scripts/create-admin.mjs).
// Cookie de sessão: essencial, httpOnly, restrito a /admin. Limite de login em tabela (rate_limit_auth).
// Inicialização preguiçosa: importar este módulo NÃO lê DATABASE_URL nem cria conexão (o build do Next coleta rotas sem variáveis).
// A instância nasce no 1º uso em tempo de execução (getDb() lança "DATABASE_URL não configurada", sem valor) e fica em cache.
function create() {
  return betterAuth({
    database: drizzleAdapter(getDb(), { provider: "pg", schema, transaction: false }),
    emailAndPassword: { enabled: true, disableSignUp: true, autoSignIn: false },
    rateLimit: {
      enabled: true,
      storage: "database",
      customRules: { "/sign-in/email": { window: 60, max: 5 } },
    },
    advanced: { defaultCookieAttributes: { path: "/admin", httpOnly: true, sameSite: "lax" } },
    plugins: [nextCookies()],
  });
}

let cached: ReturnType<typeof create> | undefined;

export function getAuth() {
  return (cached ??= create());
}
