// Perfil dos leads: só contagens por categoria (nenhum dado pessoal). A query única fica em perfil-query.ts.
import { JA_FEZ_MENTORIA, MAIOR_DESAFIO, PESSOAS, TEMPO_FUNCIONAMENTO } from "../lead-options";

export type DimPerfil = "desafio" | "tempo" | "pessoas" | "cidade" | "mentoria";
export interface LinhaPerfil { dim: DimPerfil; valor: string; n: number }
export interface GrupoPerfil { dim: DimPerfil; titulo: string; itens: { rotulo: string; n: number }[] }

const GRUPOS: { dim: DimPerfil; titulo: string; ordem: readonly string[] }[] = [
  { dim: "desafio", titulo: "Maior desafio", ordem: MAIOR_DESAFIO },
  { dim: "tempo", titulo: "Tempo de funcionamento", ordem: TEMPO_FUNCIONAMENTO },
  { dim: "pessoas", titulo: "Pessoas na equipe", ordem: PESSOAS },
  { dim: "cidade", titulo: "Top cidades", ordem: [] },
  { dim: "mentoria", titulo: "Já fez mentoria?", ordem: JA_FEZ_MENTORIA },
];

/** Maiores primeiro; empate na ordem das opções do formulário (depois alfabética). Grupos sem linha somem. */
export function montarPerfil(linhas: LinhaPerfil[]): GrupoPerfil[] {
  return GRUPOS.map(({ dim, titulo, ordem }) => {
    const pos = (v: string) => { const i = ordem.indexOf(v); return i < 0 ? ordem.length : i; };
    const itens = linhas
      .filter((l) => l.dim === dim && l.n > 0)
      .sort((a, b) => b.n - a.n || pos(a.valor) - pos(b.valor) || a.valor.localeCompare(b.valor, "pt-BR"))
      .map((l) => ({ rotulo: l.valor, n: l.n }));
    return { dim, titulo, itens };
  }).filter((g) => g.itens.length > 0);
}
