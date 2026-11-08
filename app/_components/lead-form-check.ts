import { checarCidadeUf, checarMensagem, checarNegocio, checarNome, checarWhatsapp, type Resultado, type TipoErro } from "../_lib/lead-rules";
import type { LeadField } from "../_lib/lead-schema";

/** Campos de cada passo, na ordem em que aparecem. `mensagem` é opcional e não entra na checagem de passo. */
export const CAMPOS_POR_PASSO: LeadField[][] = [
  ["nome", "whatsapp"],
  ["cidade", "negocio", "tempo", "equipe"],
  ["desafio", "curso", "consentimento"],
];
export const NOMES_DOS_PASSOS = ["Contato", "Seu negócio", "Seu momento"] as const;
export const passoDoCampo = (campo: LeadField): number => CAMPOS_POR_PASSO.findIndex((c) => c.includes(campo));

// Mesmas regras do servidor (lead-rules.ts). A lista de municípios (IBGE) fica só no servidor.
const TEXTO: Partial<Record<LeadField, (raw: string) => Resultado<unknown>>> = {
  nome: checarNome,
  whatsapp: checarWhatsapp,
  cidade: checarCidadeUf,
  negocio: checarNegocio,
  mensagem: checarMensagem,
};

export const ehCampoDeTexto = (campo: string): boolean => campo in TEXTO;

/** Avaliação de um campo de texto. null = válido. `tipo` diz quando mostrar: "invalido" na hora, "incompleto" no blur/debounce. */
export function avaliarTexto(campo: LeadField, valor: string): { erro: string; tipo: TipoErro } | null {
  const r = TEXTO[campo]?.(valor);
  return r && !r.ok ? { erro: r.erro, tipo: r.tipo } : null;
}

/** Checagem de conveniência no navegador (o servidor, com Zod, é quem decide). Devolve "" se válido. */
export function validarCampo(campo: LeadField, fd: FormData): string {
  const v = String(fd.get(campo) ?? "");
  if (campo in TEXTO) return avaliarTexto(campo, v)?.erro ?? "";
  if (campo === "consentimento") return v === "on" ? "" : "Para enviar, é preciso concordar com o contato.";
  return v.trim() ? "" : "Escolha uma opção.";
}

/** Erros de um conjunto de passos, na ordem dos campos. */
export function validarPassos(passos: number[], fd: FormData): Partial<Record<LeadField, string>> {
  const out: Partial<Record<LeadField, string>> = {};
  for (const p of passos) for (const c of CAMPOS_POR_PASSO[p]) {
    const e = validarCampo(c, fd);
    if (e) out[c] = e;
  }
  return out;
}
