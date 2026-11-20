import { z } from "zod";
import { CAMPANHAS, type Campanha } from "../db/schema";

export { CAMPANHAS, type Campanha };
/** Valor de ?campanha=: inválido ou ausente = todas (undefined). Fonte única (lista, Visão geral, CSV). */
export const campanhaSchema = z.enum(CAMPANHAS).optional().catch(undefined);
export const lerCampanha = (v: string | string[] | null | undefined): Campanha | undefined => campanhaSchema.parse((Array.isArray(v) ? v[0] : v) || undefined);

export const CAMPANHA_ROTULO: Record<Campanha, string> = { presencial: "Presencial", mentoria: "Mentoria" };
