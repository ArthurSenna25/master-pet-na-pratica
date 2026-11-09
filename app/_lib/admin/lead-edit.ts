import { z } from "zod";
import { STATUS } from "./status";

export const OBSERVACAO_MAX = 2000;

export const idSchema = z.object({ id: z.uuid() });

// textarea envia \r\n (2 chars): normaliza antes de contar, para bater com o CHECK e com o que a pessoa vê.
export const editSchema = idSchema.extend({
  status: z.enum(STATUS),
  observacao: z
    .string()
    .transform((s) => s.replace(/\r\n/g, "\n").trim())
    .pipe(z.string().max(OBSERVACAO_MAX))
    .transform((s) => s || null),
});

/** Excluir/anonimizar só valem com confirmar=sim (campo do formulário do 2º passo). */
export const confirmaSchema = idSchema.extend({ confirmar: z.literal("sim") });
