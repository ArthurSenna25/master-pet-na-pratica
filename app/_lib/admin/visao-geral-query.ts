import { asc, eq, sql } from "drizzle-orm";
import { getDb } from "../db";
import { lead } from "../db/schema";
import { STATUS, type Status } from "./status";
import { diaSP, meiaNoiteSP, preencherSemanas, semanasRecentes, type Semana } from "./visao-geral";

const HORA_MS = 3_600_000;
const LIMITE_CHAMAR = 5;

export interface ParaChamar { id: string; nome: string; negocio: string; cidadeUf: string; whatsapp: string; criadoEm: Date; anonimizado: boolean }
export interface VisaoGeral {
  total: number;
  porStatus: Record<Status, number>;
  hoje: number;
  seteDias: number;
  novosHaMaisDe48h: number;
  semanas: Semana[];
  chamar: ParaChamar[];
}

const iso = (d: Date) => d.toISOString();

/** Só agregados e os 5 mais antigos em "novo". 3 queries em paralelo; `agora` injetável para teste. */
export async function carregarVisaoGeral(agora = new Date(), db = getDb()): Promise<VisaoGeral> {
  const semanas = semanasRecentes(agora);
  const inicioJanela = meiaNoiteSP(semanas[0]);
  const inicioHoje = meiaNoiteSP(diaSP(agora));
  const seteDias = new Date(agora.getTime() - 7 * 24 * HORA_MS);
  const h48 = new Date(agora.getTime() - 48 * HORA_MS);
  const n = (q: ReturnType<typeof sql>) => q.mapWith(Number);

  const [[tot], porSemana, chamar] = await Promise.all([
    db.select({
      total: n(sql`count(*)`),
      hoje: n(sql`count(*) filter (where ${lead.criadoEm} >= ${iso(inicioHoje)}::timestamptz)`),
      seteDias: n(sql`count(*) filter (where ${lead.criadoEm} >= ${iso(seteDias)}::timestamptz)`),
      velhos: n(sql`count(*) filter (where ${lead.status} = 'novo' and ${lead.criadoEm} < ${iso(h48)}::timestamptz)`),
      novo: n(sql`count(*) filter (where ${lead.status} = 'novo')`),
      em_contato: n(sql`count(*) filter (where ${lead.status} = 'em_contato')`),
      convertido: n(sql`count(*) filter (where ${lead.status} = 'convertido')`),
      nao_convertido: n(sql`count(*) filter (where ${lead.status} = 'nao_convertido')`),
    }).from(lead),
    // Semana ISO (segunda) no fuso de SP; fuso como literal (parâmetro faria o GROUP BY divergir do SELECT).
    db.select({
      semana: sql<string>`to_char(date_trunc('week', ${lead.criadoEm} at time zone 'America/Sao_Paulo'), 'YYYY-MM-DD')`,
      n: n(sql`count(*)`),
    }).from(lead).where(sql`${lead.criadoEm} >= ${iso(inicioJanela)}::timestamptz`).groupBy(sql`1`),
    db.select({ id: lead.id, nome: lead.nome, negocio: lead.negocio, cidadeUf: lead.cidadeUf, whatsapp: lead.whatsapp, criadoEm: lead.criadoEm, anonimizadoEm: lead.anonimizadoEm })
      .from(lead).where(eq(lead.status, "novo")).orderBy(asc(lead.criadoEm)).limit(LIMITE_CHAMAR),
  ]);

  const porStatus = Object.fromEntries(STATUS.map((s) => [s, tot[s]])) as Record<Status, number>;
  return {
    total: tot.total,
    porStatus,
    hoje: tot.hoje,
    seteDias: tot.seteDias,
    novosHaMaisDe48h: tot.velhos,
    semanas: preencherSemanas(semanas, porSemana),
    chamar: chamar.map(({ anonimizadoEm, ...c }) => ({ ...c, anonimizado: anonimizadoEm !== null })),
  };
}
