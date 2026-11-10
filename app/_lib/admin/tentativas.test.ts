import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { getDb } from "../db";
import { rateLimit } from "../db/schema";
import { bloqueado, RETENCAO_MS, registrarFalha, zerar } from "./tentativas";

const regra = { max: 3, janelaMs: 60_000 };
const chaves: string[] = [];
const nova = () => { const k = `zz-teste-${randomUUID()}`; chaves.push(k); return k; };
afterEach(async () => { for (const k of chaves.splice(0)) await zerar(k); });

describe("tentativas (tabela rate_limit_auth)", () => {
  it("bloqueia ao atingir o máximo dentro da janela", async () => {
    const k = nova(); const t = 1_000_000;
    for (let i = 0; i < 2; i++) await registrarFalha(k, regra, t + i);
    expect(await bloqueado(k, regra, t + 10)).toBe(false);
    await registrarFalha(k, regra, t + 3);
    expect(await bloqueado(k, regra, t + 10)).toBe(true);
  });
  it("libera depois da janela e recomeça a contagem em 1", async () => {
    const k = nova(); const t = 2_000_000;
    for (let i = 0; i < 3; i++) await registrarFalha(k, regra, t);
    expect(await bloqueado(k, regra, t + regra.janelaMs + 1)).toBe(false);
    await registrarFalha(k, regra, t + regra.janelaMs + 1);
    expect(await bloqueado(k, regra, t + regra.janelaMs + 2)).toBe(false);
  });
  it("zerar libera na hora", async () => {
    const k = nova(); const t = 3_000_000;
    for (let i = 0; i < 3; i++) await registrarFalha(k, regra, t);
    await zerar(k);
    expect(await bloqueado(k, regra, t + 1)).toBe(false);
  });
  it("retenção: apaga linhas app: com mais de 24 h ao registrar outra falha, e não toca nas de outros prefixos", async () => {
    const velha = nova(); const alheia = `zz-teste-sem-app-${randomUUID()}`; chaves.push(alheia);
    const t = 10 * RETENCAO_MS;
    await getDb().insert(rateLimit).values({ id: randomUUID(), key: `app:${velha}`, count: 1, lastRequest: t - RETENCAO_MS - 1 });
    await getDb().insert(rateLimit).values({ id: randomUUID(), key: alheia, count: 1, lastRequest: 1 });
    await registrarFalha(nova(), regra, t);
    expect(await getDb().select().from(rateLimit).where(eq(rateLimit.key, `app:${velha}`))).toHaveLength(0);
    expect(await getDb().select().from(rateLimit).where(eq(rateLimit.key, alheia))).toHaveLength(1);
  });
});
