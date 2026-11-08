"use server";
import { and, count, eq, gt, lt } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { getDb } from "./db";
import { consentEvents, lead, rateLimitEnvio } from "./db/schema";
import { CONSENT_TEXT, LEGAL_TEXT_VERSION } from "./legal-version";
import { errosPorCampo, leadSchema, type LeadField } from "./lead-schema";
import { corteRetencao, inicioJanela, isLimited } from "./rate-limit";
import { getClientIp, ipHmac, sha256Hex } from "./seguranca";

export interface LeadState {
  ok?: boolean;
  message?: string;
  errors?: Partial<Record<LeadField, string>>;
  /** Valores digitados, devolvidos para repopular o form (o consentimento nunca volta marcado). */
  values?: Record<string, string>;
}

const ERRO_GENERICO = "Não foi possível enviar agora. Tente de novo em instantes.";
const ERRO_LIMITE = "Muitos envios em pouco tempo. Aguarde alguns minutos e tente de novo.";
const MAX_ORIGEM = 300;
const MAX_UA = 400;

export async function enviarLead(_prev: LeadState, form: FormData): Promise<LeadState> {
  // 1. honeypot: preenchido = descarta e responde sucesso genérico (não revela o filtro)
  if (String(form.get("site") ?? "").trim() !== "") return { ok: true };

  // 2. validação no servidor
  const raw = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;
  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    const values = Object.fromEntries(Object.entries(raw).filter(([k]) => k !== "consentimento" && k !== "site" && !k.startsWith("$")));
    return { errors: errosPorCampo(parsed.error), values };
  }
  const d = parsed.data;

  // 3. IP -> HMAC (sem header em produção: recusa)
  const h = await headers();
  const ip = getClientIp(h);
  if (!ip) return { message: ERRO_GENERICO };
  const agora = Date.now();

  try {
    const db = getDb();
    const hmac = ipHmac(ip);

    // 4. limite por IP (tabela). ponytail: contar e inserir não é atômico; uma corrida deixa passar 1–2 envios a mais.
    const [{ n }] = await db
      .select({ n: count() })
      .from(rateLimitEnvio)
      .where(and(eq(rateLimitEnvio.ipHmac, hmac), gt(rateLimitEnvio.criadoEm, inicioJanela(agora))));
    if (isLimited(n)) return { message: ERRO_LIMITE };

    // 5. tudo na MESMA transação (db.batch): retenção do limite, registro do limite, lead, consentimento
    const leadId = randomUUID();
    const origem = h.get("referer")?.slice(0, MAX_ORIGEM) ?? "(desconhecida)";
    const quando = new Date(agora);
    await db.batch([
      db.delete(rateLimitEnvio).where(lt(rateLimitEnvio.criadoEm, corteRetencao(agora))),
      db.insert(rateLimitEnvio).values({ ipHmac: hmac, criadoEm: quando }),
      db.insert(lead).values({
        id: leadId,
        nome: d.nome,
        whatsapp: d.whatsapp,
        cidadeUf: d.cidade,
        negocio: d.negocio,
        tempoFuncionamento: d.tempo,
        pessoas: d.equipe,
        maiorDesafio: d.desafio,
        jaFezMentoria: d.curso === "Sim",
        mensagem: d.mensagem ?? null,
        origem,
        criadoEm: quando,
        atualizadoEm: quando,
      }),
      db.insert(consentEvents).values({
        leadId,
        tipo: "aceite",
        textoVersao: LEGAL_TEXT_VERSION,
        textoHash: sha256Hex(CONSENT_TEXT),
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
    return { message: ERRO_GENERICO };
  }
}
