// PROVISÓRIO: opções dos selects ainda não validadas pela Camila. Fonte única (form + Zod).
export const TEMPO_FUNCIONAMENTO = ["Menos de 1 ano", "1 a 3 anos", "3 a 5 anos", "Mais de 5 anos"] as const;
export const PESSOAS = ["Só eu", "2 a 3", "4 ou mais"] as const;
export const MAIOR_DESAFIO = [
  "Organização e processos",
  "Precificação e financeiro",
  "Equipe",
  "Atendimento e clientes",
  "Tudo isso junto",
] as const;
export const JA_FEZ_MENTORIA = ["Sim", "Não"] as const;

// Campanha mentoria (F10): os códigos do formulário viram os MESMOS rótulos acima, para o painel e o perfil agregarem as duas campanhas.
export const TEMPO_MENTORIA = { "menos-1": "Menos de 1 ano", "1-3": "1 a 3 anos", "3-5": "3 a 5 anos", "mais-5": "Mais de 5 anos" } as const;
export const EQUIPE_MENTORIA = { "so-eu": "Só eu", "2-3": "2 a 3", "4-mais": "4 ou mais" } as const;
export const DESAFIO_MENTORIA = {
  processos: "Organização e processos",
  preco: "Precificação e financeiro",
  equipe: "Equipe",
  atendimento: "Atendimento e clientes",
  tudo: "Tudo isso junto",
} as const;
