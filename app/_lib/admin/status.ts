export const STATUS = ["novo", "em_contato", "convertido", "nao_convertido"] as const;
export type Status = (typeof STATUS)[number];
export const STATUS_ROTULO: Record<Status, string> = {
  novo: "Novo",
  em_contato: "Em contato",
  convertido: "Convertido",
  nao_convertido: "Não convertido",
};
