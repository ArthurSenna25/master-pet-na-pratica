import { z } from "zod";
import { JA_FEZ_MENTORIA, MAIOR_DESAFIO, PESSOAS, TEMPO_FUNCIONAMENTO } from "./lead-options";
import { checarCidadeUf, checarMensagem, checarNegocio, checarNome, checarWhatsapp, type Resultado } from "./lead-rules";
import { buscarMunicipio } from "./municipios";

const opcao = <T extends readonly [string, ...string[]]>(valores: T) => z.enum(valores, { error: "Escolha uma opção." });

/** Campo de texto validado pelas regras compartilhadas (lead-rules.ts); o valor de saída já vem normalizado. */
function regra<T>(fn: (raw: string) => Resultado<T>, ausente: string) {
  return z.string({ error: ausente }).transform((raw, ctx) => {
    const r = fn(raw);
    if (!r.ok) {
      ctx.issues.push({ code: "custom", message: r.erro, input: raw });
      return z.NEVER;
    }
    return r.valor;
  });
}

/** Formato (compartilhado) + existência da cidade na UF (IBGE, só no servidor). Saída: "Cidade/UF" com o nome oficial. */
const cidadeUf = regra((raw) => {
  const r = checarCidadeUf(raw);
  if (!r.ok) return r;
  const oficial = buscarMunicipio(r.valor.cidade, r.valor.uf);
  if (!oficial) return { ok: false as const, erro: "Cidade não encontrada nesta UF. Confira a grafia.", tipo: "invalido" as const };
  return { ok: true as const, valor: `${oficial}/${r.valor.uf}` };
}, "Informe a cidade/UF.");

/** Nomes dos campos = atributos `name` do formulário. */
export const leadSchema = z.object({
  nome: regra(checarNome, "Informe seu nome."),
  whatsapp: regra(checarWhatsapp, "Informe o WhatsApp com DDD."),
  cidade: cidadeUf,
  negocio: regra(checarNegocio, "Informe o nome do negócio."),
  tempo: opcao(TEMPO_FUNCIONAMENTO),
  equipe: opcao(PESSOAS),
  desafio: opcao(MAIOR_DESAFIO),
  curso: opcao(JA_FEZ_MENTORIA),
  mensagem: z.string().optional().transform((raw, ctx) => {
    const r = checarMensagem(raw ?? "");
    if (!r.ok) {
      ctx.issues.push({ code: "custom", message: r.erro, input: raw });
      return z.NEVER;
    }
    return r.valor;
  }),
  consentimento: z.literal("on", { error: "Para enviar, é preciso concordar com o contato." }),
});

export type LeadInput = z.infer<typeof leadSchema>;
export type LeadField = keyof LeadInput;

/** Primeiro erro de cada campo. */
export function errosPorCampo(error: z.ZodError): Partial<Record<LeadField, string>> {
  const out: Partial<Record<LeadField, string>> = {};
  for (const issue of error.issues) {
    const campo = issue.path[0] as LeadField | undefined;
    if (campo && !out[campo]) out[campo] = issue.message;
  }
  return out;
}
