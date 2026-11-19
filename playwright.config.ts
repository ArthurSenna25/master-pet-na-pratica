import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Porta 3000 = BETTER_AUTH_URL (Origin do Better Auth). Banco = o apontado por DATABASE_URL (branch "teste" do Neon).
// O servidor herda o process.env; rode `npm run build` antes.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  testDir: "e2e",
  workers: 1,
  timeout: 60_000,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3000" },
  // MENTORIA_FORM_ATIVO=1: `next start` roda com NODE_ENV=production e o flag falha fechado; os e2e da mentoria precisam do formulário ligado.
  // 2º servidor (3001) com o formulário DESLIGADO, só para e2e/mentoria-off.spec.ts.
  webServer: [
    { command: "npx next start -p 3000", url: "http://localhost:3000", reuseExistingServer: true, timeout: 60_000, env: { MENTORIA_FORM_ATIVO: "1" } },
    { command: "npx next start -p 3001", url: "http://localhost:3001", reuseExistingServer: true, timeout: 60_000, env: { MENTORIA_FORM_ATIVO: "0" } },
  ],
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] }, testIgnore: /mentoria-off/ },
    { name: "webkit", use: { ...devices["Desktop Safari"] }, testIgnore: /mentoria-off/ },
    { name: "mentoria-off", use: { ...devices["Desktop Chrome"] }, testMatch: /mentoria-off/ },
  ],
});
