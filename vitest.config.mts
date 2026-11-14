import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Testes de banco usam o .env.local (branch "teste" do Neon). Os workers herdam o process.env.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({ resolve: { alias: { "server-only": fileURLToPath(new URL("./vitest.server-only.ts", import.meta.url)) } }, test: { fileParallelism: false, include: ["app/**/*.test.ts"], testTimeout: 20_000 } });
