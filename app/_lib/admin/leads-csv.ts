import "server-only";
import { asc } from "drizzle-orm";
import { getDb } from "../db";
import { lead } from "../db/schema";
import { montarCsv } from "./csv";
import { registrarExportacao } from "./events";

// SAÍDA DE DADO PESSOAL. Fora: ip_hmac, user_agent e todo consent_events (isso é a auditoria). Quem chamar DEVE ter checado a sessão.
export const CABECALHO_LEADS = [
  "id", "nome", "whatsapp", "cidade_uf", "negocio", "tempo_funcionamento", "pessoas", "maior_desafio",
  "ja_fez_mentoria", "mensagem", "status", "observacao", "origem", "criado_em_utc", "atualizado_em_utc", "anonimizado_em_utc",
] as const;

/**
 * Registra o export (admin_events + audit_log, sem dado pessoal) ANTES de ler, na mesma transação.
 * Lead anonimizado sai só com id, status e datas: os campos pessoais são zerados aqui também (defesa em profundidade).
 * ponytail: sem LIMIT (volume N2 pequeno); acima de ~100 mil linhas, paginar/stream.
 */
export async function gerarCsvLeads(db = getDb()): Promise<string> {
  await registrarExportacao("export_leads", db);
  const rows = await db.select().from(lead).orderBy(asc(lead.criadoEm));
  return montarCsv(
    CABECALHO_LEADS,
    rows.map((l) => {
      const anon = l.anonimizadoEm !== null;
      const p = <T>(v: T) => (anon ? "" : v); // pessoal: vazio se anonimizado
      return [
        l.id, p(l.nome), p(l.whatsapp), p(l.cidadeUf), p(l.negocio), p(l.tempoFuncionamento), p(l.pessoas), p(l.maiorDesafio),
        p(l.jaFezMentoria), p(l.mensagem), l.status, p(l.observacao), p(l.origem), l.criadoEm, l.atualizadoEm, l.anonimizadoEm,
      ];
    }),
  );
}
