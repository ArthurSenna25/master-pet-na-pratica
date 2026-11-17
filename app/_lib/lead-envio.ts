import "server-only";
import { and, count, eq, gt, lt } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { getDb } from "./db";
import { consentEvents, lead, rateLimitEnvio, type Campanha } from "./db/schema";
import { CONSENTIMENTOS, LEGAL_TEXT_VERSION } from "./legal-version";
import { errosPorCampo, leadSchema } from "./lead-schema";
import { leadMentoriaSchema } from "./lead-schema-mentoria";
import { origemCampanha, origemSegura } from "./lead-origem";
import { formMentoriaAtivo } from "./mentoria-flag";
import { corteRetencao, inicioJanela, inicioJanelaGlobal, isLimited, isTetoGlobal } from "./rate-limit";
import { getClientIp, ipHmac, sha256Hex } from "./seguranca";

export interface LeadState {
  ok?: boolean;
  message?: string;
  errors?: Partial<Record<string, string>>;
  /** Valores digitados, devolvidos para repopular o form (o consentimento nunca volta marcado). */
  values?: Record<string, string>;
}

const ERRO_GENERICO = "Não foi possível enviar agora. Tente de novo em instantes.";
const ERRO_LIMITE = "Muitos envios em pouco tempo. Aguarde alguns minutos e tente de novo."; // limite por IP
// Teto global (janela de 1 h). [PENDENTE: canal alternativo para quem for barrado, ex. contato da Camila; não inventar número]
const ERRO_TETO = "Muitos envios no momento. Tente de novo em cerca de uma hora.";
const ERRO_FORM_FECHADO = "As pré-inscrições ainda não abriram.";
const MAX_UA = 400;

const valoresDigitados = (raw: Record<string, string>) =>
  Object.fromEntries(Object.entries(raw).filter(([k]) => k !== "consentimento" && k !== "site" && !k.startsWith("$")));

/** Campos que o servidor grava por campanha, já validados. `mensagem`/`curso` só existem no presencial. */
interface Dados {
  nome: string; whatsapp: string; cidade: string; negocio: string; tempo: string; equipe: string; desafio: string;
  jaFezMentoria: boolean | null; mensagem: string | null; origemCampanha: string | null;
}

type Leitura = { ok: true; d: Dados } | { ok: false; errors: Partial<Record<string, string>> };

function ler(campanha: Campanha, raw: Record<string, string>): Leitura {
  if (campanha === "mentoria") {
    const p = leadMentoriaSchema.safeParse(raw);
    if (!p.success) return { ok: false, errors: errosPorCampo(p.error) };
    const d = p.data;
    return { ok: true, d: { ...d, jaFezMentoria: null, mensagem: null, origemCampanha: origemCampanha(raw.origem_campanha) } };
  }
  const p = leadSchema.safeParse(raw);
  if (!p.success) return { ok: false, errors: errosPorCampo(p.error) };
  const d = p.data;
  return { ok: true, d: { ...d, jaFezMentoria: d.curso === "Sim", mensagem: d.mensagem ?? null, origemCampanha: null } };
}

/**
 * Envio do formulário. A CAMPANHA é argumento do servidor (as duas actions de lead-action.ts a fixam): nada que venha no POST a escolhe.
 * Limite por IP é compartilhado entre campanhas; o teto global é por campanha (um pico numa não trava a outra).
 */
export async function processarEnvio(campanha: Campanha, form: FormData): Promise<LeadState> {
  // 0. formulário da mentoria desativado (produção, por padrão): recusa antes de ler/gravar qualquer coisa
  if (campanha === "mentoria" && !formMentoriaAtivo()) return { message: ERRO_FORM_FECHADO };

  // 1. honeypot: preenchido = descarta e responde sucesso genérico (não revela o filtro)
  if (String(form.get("site") ?? "").trim() !== "") return { ok: true };

  // 2. validação no servidor
  const raw = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;
  const lido = ler(campanha, raw);
  if (!lido.ok) {
    return { errors: lido.errors, values: valoresDigitados(raw) };
  }
  const d = lido.d;
  // Erro do servidor (limite, teto, falha): o React 19 zera o formulário após a action; devolver o que foi digitado evita perder tudo (consentimento nunca volta).
  const falha = (message: string): LeadState => ({ message, values: valoresDigitados(raw) });

  // 3. IP -> HMAC (sem header em produção: recusa)
  const h = await headers();
  const ip = getClientIp(h);
  if (!ip) return falha(ERRO_GENERICO);
  const agora = Date.now();

  try {
    const db = getDb();
    const hmac = ipHmac(ip);

    // 4. limite por IP (qualquer campanha). ponytail: contar e inserir não é atômico; uma corrida deixa passar 1–2 envios a mais.
    const [{ n }] = await db
      .select({ n: count() })
      .from(rateLimitEnvio)
      .where(and(eq(rateLimitEnvio.ipHmac, hmac), gt(rateLimitEnvio.criadoEm, inicioJanela(agora))));
    if (isLimited(n)) return falha(ERRO_LIMITE);

    // 4b. teto global/hora DA CAMPANHA (qualquer IP). Resposta honesta (não ok:true); log só com o nome do evento, sem dado pessoal.
    const [{ total }] = await db
      .select({ total: count() })
      .from(rateLimitEnvio)
      .where(and(eq(rateLimitEnvio.campanha, campanha), gt(rateLimitEnvio.criadoEm, inicioJanelaGlobal(agora))));
    if (isTetoGlobal(total)) {
      console.warn("lead_teto_global_atingido");
      return falha(ERRO_TETO);
    }

    // 5. tudo na MESMA transação (db.batch): retenção do limite, registro do limite, lead, consentimento
    const leadId = randomUUID();
    const origem = origemSegura(h.get("referer"));
    const quando = new Date(agora);
    await db.batch([
      db.delete(rateLimitEnvio).where(lt(rateLimitEnvio.criadoEm, corteRetencao(agora))),
      db.insert(rateLimitEnvio).values({ ipHmac: hmac, campanha, criadoEm: quando }),
      db.insert(lead).values({
        id: leadId,
        nome: d.nome,
        whatsapp: d.whatsapp,
        cidadeUf: d.cidade,
        negocio: d.negocio,
        tempoFuncionamento: d.tempo,
        pessoas: d.equipe,
        maiorDesafio: d.desafio,
        jaFezMentoria: d.jaFezMentoria,
        mensagem: d.mensagem,
        campanha,
        origemCampanha: d.origemCampanha,
        origem,
        criadoEm: quando,
        atualizadoEm: quando,
      }),
      db.insert(consentEvents).values({
        leadId,
        tipo: "aceite",
        textoVersao: LEGAL_TEXT_VERSION,
        textoHash: sha256Hex(CONSENTIMENTOS[campanha]),
        aceitoEm: quando,
        origem,
        userAgent: h.get("user-agent")?.slice(0, MAX_UA) ?? null,
        ipHmac: hmac,
      }),
    ]);
    return { ok: true };
  } catch (e) {
    // nunca logar valores nem a mensagem do driver (pode conter dados): só nome e código
    console.error("lead_envio_falhou", e instanceof Error ? e.name : "erro", (e as { code?: string })?.code ?? "");
    return falha(ERRO_GENERICO);
  }
}
