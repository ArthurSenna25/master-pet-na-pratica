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
  webServer: { command: "npx next start -p 3000", url: "http://localhost:3000", reuseExistingServer: true, timeout: 60_000 },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
