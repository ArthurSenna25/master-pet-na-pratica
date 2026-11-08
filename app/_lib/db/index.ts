// Só importar em código de servidor (actions, route handlers, scripts). Conexão preguiçosa: build não exige DATABASE_URL.
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let cached: ReturnType<typeof create> | undefined;

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não configurada");
  return drizzle(neon(url), { schema });
}

export function getDb() {
  return (cached ??= create());
}
