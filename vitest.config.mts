import { existsSync } from "node:fs";
import { defineConfig } from "vitest/config";

// Testes de banco usam o .env.local (branch "teste" do Neon). Os workers herdam o process.env.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({ test: { fileParallelism: false, include: ["app/**/*.test.ts"], testTimeout: 20_000 } });
