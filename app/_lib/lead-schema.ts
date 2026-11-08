import { z } from "zod";
import { JA_FEZ_MENTORIA, MAIOR_DESAFIO, PESSOAS, TEMPO_FUNCIONAMENTO } from "./lead-options";

const texto = (min: number, max: number, msg: string) => z.string({ error: msg }).trim().min(min, msg).max(max, msg);
const opcao = <T extends readonly [string, ...string[]]>(valores: T) => z.enum(valores, { error: "Escolha uma opção." });

/** Só dígitos; aceita +55 na frente. 10–11 dígitos = DDD + número. */
function soDigitos(v: string): string {
  const d = v.replace(/\D/g, "");
  return d.length > 11 && d.startsWith("55") ? d.slice(2) : d;
}

/** Nomes dos campos = atributos `name` do formulário. */
export const leadSchema = z.object({
  nome: texto(2, 100, "Informe seu nome."),
  whatsapp: z
    .string({ error: "Informe o WhatsApp com DDD." })
    .transform(soDigitos)
    .pipe(z.string().regex(/^\d{10,11}$/, "Informe o WhatsApp com DDD.")),
  cidade: texto(2, 80, "Informe a cidade/UF."),
  negocio: texto(2, 100, "Informe o nome do negócio."),
  tempo: opcao(TEMPO_FUNCIONAMENTO),
  equipe: opcao(PESSOAS),
  desafio: opcao(MAIOR_DESAFIO),
  curso: opcao(JA_FEZ_MENTORIA),
  mensagem: z.string().trim().max(1000, "Mensagem muito longa.").optional().transform((v) => v || undefined),
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
