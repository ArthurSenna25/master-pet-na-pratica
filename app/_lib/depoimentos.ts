/** Depoimentos da landing. Trocar pelos reais = editar este arquivo (ver docs/_projeto/handoff/depoimentos/CONTEUDO.md). */
export interface Depoimento {
  quote: string;
  name: string;
  business: string;
  city: string;
  team: string;
  /** Interno, não exibido: sem consent=true o depoimento não publica. */
  consent: boolean;
  /** true exibe o selo "exemplo". Retirar só com conteúdo real e autorização por escrito. */
  isExample: boolean;
}

// FICTÍCIOS, só para a demo de venda (DECISOES-LGPD: pendência de depoimentos reais).
const base = { name: "Nome da cliente", business: "Salão exemplo", city: "Cidade/UF", consent: true, isExample: true } as const;

export const DESTAQUE: Depoimento = {
  ...base,
  quote: "[exemplo] Aqui entra a frase de destaque da cliente: a mudança concreta que ela percebeu no dia a dia do salão depois de aplicar com a Camila.",
  team: "equipe de 3",
};

export const DEPOIMENTOS: Depoimento[] = [
  { ...base, quote: "[exemplo] Aqui entra a frase da cliente sobre uma mudança concreta em a rotina da equipe do salão.", team: "equipe de 3" },
  { ...base, quote: "[exemplo] Aqui entra a frase da cliente sobre uma mudança concreta em a precificação do salão.", team: "equipe de 2" },
  { ...base, quote: "[exemplo] Aqui entra a frase da cliente sobre uma mudança concreta em o fluxo de atendimento do salão.", team: "equipe de 5" },
  { ...base, quote: "[exemplo] Aqui entra a frase da cliente sobre uma mudança concreta em o padrão de tosa do salão.", team: "equipe de 3" },
  { ...base, quote: "[exemplo] Aqui entra a frase da cliente sobre uma mudança concreta em a agenda do dia do salão.", team: "equipe de 4" },
  { ...base, quote: "[exemplo] Aqui entra a frase da cliente sobre uma mudança concreta em a comunicação com o tutor do salão.", team: "equipe de 3" },
];

/** Só o que tem autorização registrada. */
export const publicaveis = (l: Depoimento[]): Depoimento[] => l.filter((d) => d.consent);

/** Iniciais (primeira e última palavra) para o avatar; sem foto de pessoa. */
export function iniciais(name: string): string {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? (p[p.length - 1]?.[0] ?? "") : "")).toUpperCase();
}
