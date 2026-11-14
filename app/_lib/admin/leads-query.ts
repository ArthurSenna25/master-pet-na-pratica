import "server-only";
import { and, asc, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { getDb } from "../db";
import { lead } from "../db/schema";
import { padraoTelefone, padraoTexto, POR_PAGINA, type ParamsLista } from "./busca";
import { STATUS, type Status } from "./status";

export function filtros(p: Pick<ParamsLista, "q" | "status">): SQL | undefined {
  const texto = padraoTexto(p.q);
  const tel = padraoTelefone(p.q);
  const buscas: SQL[] = [];
  if (texto) buscas.push(ilike(lead.nome, texto), ilike(lead.negocio, texto), ilike(lead.cidadeUf, texto));
  if (tel) buscas.push(sql`${lead.whatsapp} like ${tel}`);
  return and(p.status ? eq(lead.status, p.status) : undefined, buscas.length ? or(...buscas) : undefined);
}

export async function listarLeads(p: ParamsLista, db = getDb()) {
  const where = filtros(p);
  const [{ total }] = await db.select({ total: count() }).from(lead).where(where);
  const linhas = await db
    .select()
    .from(lead)
    .where(where)
    .orderBy(p.ordem === "asc" ? asc(lead.criadoEm) : desc(lead.criadoEm))
    .limit(POR_PAGINA)
    .offset((p.pagina - 1) * POR_PAGINA);
  return { total, linhas };
}

export async function resumoPorStatus(db = getDb()): Promise<Record<Status, number>> {
  const r = await db.select({ status: lead.status, n: count() }).from(lead).groupBy(lead.status);
  const out = Object.fromEntries(STATUS.map((s) => [s, 0])) as Record<Status, number>;
  for (const { status, n } of r) if (status in out) out[status as Status] = n;
  return out;
}
