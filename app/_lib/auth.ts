import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getDb } from "./db";
import * as schema from "./db/schema";

// Login único: cadastro público DESLIGADO (o admin nasce em scripts/create-admin.mjs).
// Cookie de sessão: essencial, httpOnly, restrito a /admin. Limite de login em tabela (rate_limit_auth).
export const auth = betterAuth({
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
