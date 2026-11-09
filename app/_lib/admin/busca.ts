import { z } from "zod";
import { STATUS } from "./status";

export const POR_PAGINA = 20;
/** Telefone só entra na busca com 3+ dígitos (evita '%2%' casar tudo). */
const MIN_DIGITOS = 3;

/** Escapa \ % _ para o ILIKE tratar o termo como texto literal. */
export const escaparLike = (t: string) => t.replace(/[\\%_]/g, (c) => "\\" + c);

export function padraoTexto(termo: string): string | null {
  const t = termo.trim();
  return t ? `%${escaparLike(t)}%` : null;
}

export function padraoTelefone(termo: string): string | null {
  const d = termo.replace(/\D/g, "");
  return d.length >= MIN_DIGITOS ? `%${d}%` : null;
}

const paramsSchema = z.object({
  q: z.string().trim().max(100).catch(""),
  status: z.enum(STATUS).optional().catch(undefined),
  ordem: z.enum(["desc", "asc"]).catch("desc"),
  pagina: z.coerce.number().int().min(1).max(10000).catch(1),
});
export type ParamsLista = z.infer<typeof paramsSchema>;

export function lerParams(raw: Record<string, string | string[] | undefined>): ParamsLista {
  const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return paramsSchema.parse({ q: um(raw.q) ?? "", status: um(raw.status) || undefined, ordem: um(raw.ordem), pagina: um(raw.pagina) });
}
