import { z } from "zod";
import { DESAFIO_MENTORIA, EQUIPE_MENTORIA, TEMPO_MENTORIA } from "./lead-options";
import { leadSchema } from "./lead-schema";

/** Mapeia o código do formulário da mentoria para o rótulo gravado (o mesmo da campanha presencial). */
const codigo = <M extends Record<string, string>>(mapa: M) =>
  z.enum(Object.keys(mapa) as [keyof M & string, ...(keyof M & string)[]], { error: "Escolha uma opção." }).transform((c) => mapa[c] as string);

/** Pré-inscrição da mentoria (F10): sem `curso` nem `mensagem`. Chaves não listadas (inclusive `campanha`) são descartadas pelo z.object.
 *  `origem_campanha` NÃO está aqui: é opcional e nunca gera erro (ver origemCampanha em lead-origem.ts). */
export const leadMentoriaSchema = z.object({
  nome: leadSchema.shape.nome,
  whatsapp: leadSchema.shape.whatsapp,
  cidade: leadSchema.shape.cidade,
  negocio: leadSchema.shape.negocio,
  tempo: codigo(TEMPO_MENTORIA),
  equipe: codigo(EQUIPE_MENTORIA),
  desafio: codigo(DESAFIO_MENTORIA),
  consentimento: leadSchema.shape.consentimento,
});

export type LeadMentoriaField = keyof z.input<typeof leadMentoriaSchema>;
