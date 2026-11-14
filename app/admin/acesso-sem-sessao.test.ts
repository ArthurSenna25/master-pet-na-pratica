// Toda página, rota e action do /admin nega sem sessão. Descoberta por glob: arquivo novo entra no teste sozinho.
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ headers: async () => new Headers(), cookies: async () => ({ toString: () => "" }) }));

const paginas = import.meta.glob("./**/page.tsx");
const rotas = import.meta.glob("./**/route.ts");
const acoes = import.meta.glob(["./actions.ts", "./lead-actions.ts"]);

/** Públicas ou sem conteúdo (render null/fallback): lista explícita; qualquer página nova fora dela TEM de redirecionar sem sessão. */
const PUBLICAS = new Set(["./login/page.tsx", "./@modal/page.tsx", "./@modal/[...catchAll]/page.tsx"]);
const args = { params: Promise.resolve({ id: "00000000-0000-4000-8000-000000000000" }), searchParams: Promise.resolve({}) };

describe("descoberta", () => {
  it("encontra todas as superfícies (guarda contra glob vazio)", () => {
    expect(Object.keys(paginas).length).toBeGreaterThanOrEqual(7);
    expect(Object.keys(rotas).sort()).toEqual(["./auditoria.csv/route.ts", "./decisoes-lgpd/route.ts", "./leads.csv/route.ts"]);
    expect(Object.keys(paginas)).toContain("./@modal/(.)lead/[id]/page.tsx");
  });
  it('arquivos "use server" conhecidos: um novo exige revisão', async () => {
    const { globSync } = await import("node:fs");
    const achados = globSync("app/**/*.{ts,tsx}").filter((f) => /^\s*["']use server["']/.test(readFileSync(f, "utf8"))).map((f) => f.replaceAll("\\", "/")).sort();
    expect(achados).toEqual(["app/_lib/lead-action.ts", "app/admin/actions.ts", "app/admin/lead-actions.ts"]);
  });
});

describe("páginas do admin sem sessão", () => {
  for (const [caminho, carregar] of Object.entries(paginas)) {
    if (PUBLICAS.has(caminho)) continue;
    it(`${caminho} redireciona ao login`, async () => {
      const mod = (await carregar()) as { default: (a: typeof args) => Promise<unknown> };
      await expect(mod.default(args)).rejects.toMatchObject({ digest: expect.stringContaining("/admin/login") });
    });
  }
  it("as exceções (login, @modal vazios) não expõem dado", async () => {
    for (const c of ["./@modal/page.tsx", "./@modal/[...catchAll]/page.tsx"]) {
      const mod = (await paginas[c]()) as { default: () => unknown };
      expect(mod.default()).toBeNull();
    }
  });
});

describe("actions do admin sem sessão", () => {
  it("toda action exportada (exceto loginAction) é negada", async () => {
    let n = 0;
    for (const carregar of Object.values(acoes)) {
      const mod = (await carregar()) as Record<string, (...a: unknown[]) => Promise<unknown>>;
      for (const [nome, fn] of Object.entries(mod)) {
        if (typeof fn !== "function" || nome === "loginAction") continue;
        n++;
        const fd = new FormData();
        fd.set("id", "00000000-0000-4000-8000-000000000000");
        await expect(fn({}, fd), nome).rejects.toMatchObject({ digest: expect.stringContaining("NEXT_REDIRECT") });
      }
    }
    expect(n).toBeGreaterThanOrEqual(5); // logout, senha, atualizar, excluir, anonimizar
  });
});
