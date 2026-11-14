// Nenhum arquivo "use client" pode alcançar (direta ou indiretamente) os módulos de servidor com segredo/conexão.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const RAIZ = resolve(process.cwd());
const PROIBIDOS = ["app/_lib/auth.ts", "app/_lib/seguranca.ts", "app/_lib/db/index.ts"].map((p) => resolve(RAIZ, p));
const USE_SERVER = /^\s*["']use server["']/;
const EXT = [".ts", ".tsx", "/index.ts", "/index.tsx"];

const arquivos = (d: string): string[] =>
  readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    return statSync(p).isDirectory() ? arquivos(p) : /\.(ts|tsx)$/.test(n) ? [p] : [];
  });

function resolver(de: string, spec: string): string | null {
  const base = spec.startsWith("@/") ? join(RAIZ, spec.slice(2)) : spec.startsWith(".") ? resolve(dirname(de), spec) : null;
  if (!base) return null; // pacote npm
  return [base, ...EXT.map((e) => base + e)].find((c) => existsSync(c) && statSync(c).isFile()) ?? null;
}

const importes = (f: string): string[] => {
  const src = readFileSync(f, "utf8");
  return [...src.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)].map((m) => m[1]);
};

// caminho de importação de `inicio` até um módulo proibido (ou null)
function alcanca(inicio: string): string[] | null {
  const visto = new Set<string>();
  const ir = (f: string, trilha: string[]): string[] | null => {
    if (PROIBIDOS.includes(f)) return [...trilha, f];
    if (visto.has(f)) return null;
    visto.add(f);
    // "use server": o cliente recebe só uma referência da action, o módulo não vai para o bundle (exceto o próprio ponto de partida)
    if (trilha.length > 0 && USE_SERVER.test(readFileSync(f, "utf8"))) return null;
    for (const s of importes(f)) {
      const alvo = resolver(f, s);
      if (alvo) { const r = ir(alvo, [...trilha, f]); if (r) return r; }
    }
    return null;
  };
  return ir(inicio, []);
}

const clientes = arquivos(join(RAIZ, "app")).filter((f) => /^\s*["']use client["']/.test(readFileSync(f, "utf8")));

describe("fronteira cliente/servidor", () => {
  it("encontra os arquivos use client (guarda contra teste vazio)", () => {
    expect(clientes.length).toBeGreaterThanOrEqual(10);
  });
  it.each(clientes.map((f) => [f.slice(RAIZ.length + 1), f]))("%s não alcança auth/seguranca/db", (_n, f) => {
    expect(alcanca(f)?.map((p) => p.slice(RAIZ.length + 1))).toBeUndefined();
  });
  it("o detector funciona: um arquivo de servidor que importa db é flagrado", () => {
    expect(alcanca(join(RAIZ, "app/_lib/lead-action.ts"))).not.toBeNull();
    expect(alcanca(join(RAIZ, "app/_components/LeadForm.tsx"))).toBeNull(); // via "use server" = só referência
  });
});
