import "server-only";
import { sql } from "drizzle-orm";
import { getDb } from "../db";
import { lead } from "../db/schema";
import { montarPerfil, type GrupoPerfil, type LinhaPerfil } from "./perfil";

const TOP_CIDADES = 5;

/** UMA query agregada (UNION ALL), só contagens: nenhuma coluna de dado pessoal sai do banco. Conta todos os leads, anonimizados inclusive
 *  (a anonimização apaga nome/negócio/WhatsApp/mensagem/observação e mantém estes campos). */
export async function carregarPerfil(db = getDb()): Promise<GrupoPerfil[]> {
  const r = await db.execute(sql`
    select 'desafio' as dim, ${lead.maiorDesafio} as valor, count(*)::int as n from ${lead} group by 2
    union all select 'tempo', ${lead.tempoFuncionamento}, count(*)::int from ${lead} group by 2
    union all select 'pessoas', ${lead.pessoas}, count(*)::int from ${lead} group by 2
    union all select 'mentoria', case when ${lead.jaFezMentoria} then 'Sim' else 'Não' end, count(*)::int from ${lead} group by 2
    union all (select 'cidade', ${lead.cidadeUf}, count(*)::int from ${lead} group by 2 order by 3 desc, 2 limit ${TOP_CIDADES})
  `);
  return montarPerfil(r.rows as unknown as LinhaPerfil[]);
}
