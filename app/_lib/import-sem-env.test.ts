// Regressão do build do preview da Vercel (sem DATABASE_URL por regra): importar rota, página, action ou os módulos de db/auth
// NÃO pode ler DATABASE_URL nem criar conexão. A falha só vale em tempo de execução, com erro claro e sem vazar valor.
// Não toca o banco: as variáveis ficam vazias durante todo o arquivo.
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const VARS = ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "IP_HMAC_SECRET"];

// Rotas, páginas e actions do admin + as da mentoria/landing que importam _lib de servidor.
const modulos = import.meta.glob(
  ["../admin/**/route.ts", "../admin/**/page.tsx", "../admin/actions.ts", "../admin/lead-actions.ts", "../(mentoria)/**/page.tsx", "../page.tsx"],
);

beforeAll(() => { for (const v of VARS) vi.stubEnv(v, ""); });
afterAll(() => { vi.unstubAllEnvs(); });

describe("import sem variáveis de ambiente", () => {
  it("há rotas e páginas suficientes para o teste valer", () => {
    const nomes = Object.keys(modulos);
    for (const esperado of ["../admin/auditoria.csv/route.ts", "../admin/leads.csv/route.ts", "../admin/decisoes-lgpd/route.ts", "../admin/page.tsx", "../admin/actions.ts"]) expect(nomes).toContain(esperado);
  });

  it.each(Object.keys(modulos))("%s importa sem lançar", async (caminho) => {
    vi.resetModules();
    await expect(modulos[caminho]()).resolves.toBeDefined();
  });

  it("db e auth: importar não lança; getDb()/getAuth() lançam em runtime, com mensagem clara e sem valor", async () => {
    vi.resetModules();
    const { getDb } = await import("./db");
    const { getAuth } = await import("./auth");
    expect(() => getDb()).toThrow("DATABASE_URL não configurada");
    expect(() => getAuth()).toThrow("DATABASE_URL não configurada");
  });

  it("requireSession/getSessionOrNull sem banco: falham (nunca liberam) e só em runtime", async () => {
    vi.resetModules();
    vi.doMock("next/headers", () => ({ headers: async () => new Headers() }));
    const { getSessionOrNull } = await import("./session");
    await expect(getSessionOrNull()).rejects.toThrow("DATABASE_URL não configurada");
    vi.doUnmock("next/headers");
  });

  it("o erro não carrega valor de variável", async () => {
    vi.resetModules();
    vi.stubEnv("BETTER_AUTH_SECRET", "SEGREDO-NAO-VAZAR");
    const { getDb } = await import("./db");
    try { getDb(); } catch (e) { expect(String(e)).not.toContain("SEGREDO-NAO-VAZAR"); }
    vi.stubEnv("BETTER_AUTH_SECRET", "");
  });
});
