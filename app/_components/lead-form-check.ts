import type { LeadField } from "../_lib/lead-schema";

/** Campos de cada passo, na ordem em que aparecem. `mensagem` é opcional e não entra. */
export const CAMPOS_POR_PASSO: LeadField[][] = [
  ["nome", "whatsapp"],
  ["cidade", "negocio", "tempo", "equipe"],
  ["desafio", "curso", "consentimento"],
];
export const NOMES_DOS_PASSOS = ["Contato", "Seu negócio", "Seu momento"] as const;
export const passoDoCampo = (campo: LeadField): number => CAMPOS_POR_PASSO.findIndex((c) => c.includes(campo));

const OPCAO = "Escolha uma opção.";

/** Checagem de conveniência no navegador (o servidor, com Zod, é quem decide). Devolve "" se válido. */
export function validarCampo(campo: LeadField, fd: FormData): string {
  const v = String(fd.get(campo) ?? "").trim();
  switch (campo) {
    case "nome": return v.length >= 2 ? "" : "Informe seu nome.";
    case "cidade": return v.length >= 2 ? "" : "Informe a cidade/UF.";
    case "negocio": return v.length >= 2 ? "" : "Informe o nome do negócio.";
    case "whatsapp": {
      const d = v.replace(/\D/g, "");
      return /^\d{10,11}$/.test(d.length > 11 && d.startsWith("55") ? d.slice(2) : d) ? "" : "Informe o WhatsApp com DDD.";
    }
    case "consentimento": return v === "on" ? "" : "Para enviar, é preciso concordar com o contato.";
    case "mensagem": return "";
    default: return v ? "" : OPCAO;
  }
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
