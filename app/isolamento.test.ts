// GUARDA DE CI (F10 c3): grafo de imports por campanha/escopo. A landing já vazou no painel três vezes; isto falha o `npm test` se um escopo
// passar a importar (direto ou por transitivo) CSS, cenas GSAP ou código de outro escopo. Só lê arquivos; não precisa de banco nem de build.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { describe, expect, it } from "vitest";

const APP = resolve(__dirname);
const EXT = [".ts", ".tsx", ".css", ".mjs", ".js"];
const RAIZ = resolve(__dirname, "..");
const IMPORT = /(?:import|export)\s+(?:[^'"]*?\sfrom\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)|@import\s+["']([^"']+)["']|require\(\s*["']([^"']+)["']\s*\)/g;

const rel = (f: string) => relative(APP, f).split(sep).join("/");

function arquivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return arquivos(p);
    return EXT.some((e) => n.endsWith(e)) && !/\.(test|spec)\.tsx?$/.test(n) ? [p] : [];
  });
}

function resolver(de: string, alvo: string): string | null {
  const base = alvo.startsWith("@/") ? resolve(RAIZ, alvo.slice(2)) : resolve(dirname(de), alvo);
  for (const c of [base, ...EXT.map((e) => base + e), ...EXT.map((e) => join(base, "index" + e))]) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

/** Tudo que o escopo alcança: arquivos do projeto (relativos a app/) e pacotes (nomes). */
function alcance(raizes: string[]): { arquivos: Set<string>; pacotes: Set<string> } {
  const vistos = new Set<string>();
  const pacotes = new Set<string>();
  const fila = [...raizes];
  while (fila.length) {
    const f = fila.pop()!;
    if (vistos.has(f)) continue;
    vistos.add(f);
    for (const m of readFileSync(f, "utf8").matchAll(IMPORT)) {
      const alvo = m[1] ?? m[2] ?? m[3] ?? m[4];
      if (alvo.startsWith(".") || alvo.startsWith("@/")) {
        const r = resolver(f, alvo);
        if (r && r.startsWith(APP)) fila.push(r);
      } else pacotes.add(alvo.startsWith("@") ? alvo.split("/").slice(0, 2).join("/") : alvo.split("/")[0]);
    }
  }
  return { arquivos: new Set([...vistos].map(rel)), pacotes };
}

// Bibliotecas de animação: nenhuma entra em mentoria/admin/legal por import novo (GSAP da mentoria só no commit de cenas, com este guarda ajustado de propósito).
const ANIMACAO = ["gsap", "@gsap/react", "lenis", "motion", "framer-motion", "three"];
const ESCOPOS: { nome: string; pastas: string[]; proibidoArquivo: RegExp; proibidoPacote: string[] }[] = [
  { nome: "mentoria", pastas: ["(mentoria)"], proibidoArquivo: /^(landing\/|_fx\/|admin\/|_components\/(LandingFx|LeadForm|Hero|Faq|Depoimentos))/, proibidoPacote: ANIMACAO },
  { nome: "admin", pastas: ["admin"], proibidoArquivo: /^(landing\/|_fx\/|\(mentoria\)\/|_components\/LandingFx)/, proibidoPacote: ANIMACAO },
  { nome: "presencial", pastas: ["(presencial)"], proibidoArquivo: /^(admin\/|\(mentoria\)\/)/, proibidoPacote: [] },
  { nome: "legal", pastas: ["(legal)"], proibidoArquivo: /^(admin\/|\(mentoria\)\/|_fx\/|_components\/LandingFx)/, proibidoPacote: ANIMACAO },
];

describe("o scanner enxerga as formas de import que poderiam burlá-lo", () => {
  it("alias @/, import dinâmico e require alcançam _fx e gsap", () => {
    const dir = join(APP, "__tmp_isolamento__");
    mkdirSync(dir, { recursive: true });
    try {
      for (const [nome, linha] of [["alias.ts", 'import "@/app/_fx/hero";'], ["dinamico.ts", 'export const x = () => import("../_fx/hero");'], ["req.ts", 'const g = require("gsap");']] as const) {
        writeFileSync(join(dir, nome), `${linha}\n`);
        const a = alcance([join(dir, nome)]);
        expect(a.arquivos.has("_fx/hero.ts") || a.pacotes.has("gsap"), nome).toBe(true);
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("isolamento entre escopos (grafo de imports)", () => {
  it("a descoberta funciona: cada escopo tem arquivos e a landing alcança o GSAP", () => {
    for (const e of ESCOPOS) expect(e.pastas.flatMap((p) => arquivos(join(APP, p))).length, e.nome).toBeGreaterThan(0);
    const lp = alcance(arquivos(join(APP, "(presencial)")));
    expect(lp.pacotes.has("gsap")).toBe(true); // se isto falhar, o scanner não enxerga imports e os testes abaixo não provam nada
    expect(lp.arquivos.has("_fx/hero.ts")).toBe(true);
  });

  it.each(ESCOPOS)("$nome não alcança código de outro escopo nem GSAP indevido", ({ pastas, proibidoArquivo, proibidoPacote }) => {
    const a = alcance(pastas.flatMap((p) => arquivos(join(APP, p))));
    expect([...a.arquivos].filter((f) => proibidoArquivo.test(f))).toEqual([]);
    expect([...a.pacotes].filter((p) => proibidoPacote.includes(p))).toEqual([]);
  });
});
