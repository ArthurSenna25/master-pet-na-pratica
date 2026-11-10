import { sql } from "drizzle-orm";
import {
  bigint, boolean, check, index, integer, pgTable, text, timestamp, uuid,
} from "drizzle-orm/pg-core";

const agora = () => timestamp("criado_em", { withTimezone: true }).notNull().defaultNow();

export const lead = pgTable(
  "lead",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nome: text("nome").notNull(),
    whatsapp: text("whatsapp").notNull(), // só dígitos
    cidadeUf: text("cidade_uf").notNull(),
    negocio: text("negocio").notNull(),
    tempoFuncionamento: text("tempo_funcionamento").notNull(),
    pessoas: text("pessoas").notNull(),
    maiorDesafio: text("maior_desafio").notNull(),
    jaFezMentoria: boolean("ja_fez_mentoria").notNull(),
    mensagem: text("mensagem"),
    status: text("status").notNull().default("novo"),
    observacao: text("observacao"),
    origem: text("origem").notNull(),
    criadoEm: agora(),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
    anonimizadoEm: timestamp("anonimizado_em", { withTimezone: true }),
  },
  (t) => {
    // Regras espelham app/_lib/lead-rules.ts (3ª camada). [[:alpha:]] cobre letras acentuadas (testado: José, Conceição, D'Ávila).
    // Lead anonimizado (anonimizado_em) tem nome/WhatsApp/negócio vazios por desenho: fica fora destes três CHECKs.
    const anon = sql`${t.anonimizadoEm} is not null`;
    return [
      check("lead_status_ck", sql`${t.status} in ('novo','em_contato','convertido','nao_convertido')`),
      check("lead_nome_ck", sql`${anon} or (char_length(${t.nome}) between 2 and 80 and ${t.nome} ~ '^[[:alpha:]][[:alpha:] ''.-]*$' and ${t.nome} ~ '[[:alpha:]].*[[:alpha:]]')`),
      check("lead_whatsapp_ck", sql`${anon} or ${t.whatsapp} ~ '^[0-9]{10,11}$'`),
      check("lead_negocio_ck", sql`${anon} or (char_length(${t.negocio}) between 2 and 80 and ${t.negocio} ~ '[[:alpha:]]')`),
      check(
        "lead_cidade_uf_ck",
        sql`char_length(${t.cidadeUf}) <= 70 and ${t.cidadeUf} ~ '^[[:alpha:]][[:alpha:] ''-]*/[A-Z]{2}$' and right(${t.cidadeUf}, 2) in ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO')`,
      ),
      check("lead_mensagem_ck", sql`${t.mensagem} is null or char_length(${t.mensagem}) <= 1000`),
      check("lead_observacao_ck", sql`${t.observacao} is null or char_length(${t.observacao}) <= 2000`),
      check("lead_origem_ck", sql`char_length(${t.origem}) <= 300`),
    ];
  },
);

// Fonte única de consentimento. Só INSERT na operação normal; exceção: anonimizar_lead() zera ip_hmac e user_agent.
export const consentEvents = pgTable(
  "consent_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id").notNull().references(() => lead.id, { onDelete: "cascade" }), // cascade: pendência jurídica
    tipo: text("tipo").notNull().default("aceite"),
    textoVersao: text("texto_versao").notNull(),
    textoHash: text("texto_hash").notNull(),
    aceitoEm: timestamp("aceito_em", { withTimezone: true }).notNull().defaultNow(),
    origem: text("origem").notNull(),
    userAgent: text("user_agent"), // nulo após anonimização
    ipHmac: text("ip_hmac"), // nulo após anonimização
  },
  (t) => [
    index("consent_events_lead_idx").on(t.leadId),
    check("consent_tipo_ck", sql`${t.tipo} in ('aceite','revogacao')`),
  ],
);

export const rateLimitEnvio = pgTable(
  "rate_limit",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ipHmac: text("ip_hmac").notNull(),
    criadoEm: agora(),
  },
  (t) => [index("rate_limit_ip_idx").on(t.ipHmac, t.criadoEm)],
);

// Sem FK e sem dado pessoal: sobrevive à exclusão do lead. lead_id é nulo em ações sem lead (export_auditoria). Retenção: pendência jurídica.
export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  acao: text("acao").notNull(),
  leadId: uuid("lead_id"),
  criadoEm: agora(),
});

// Ações do painel (RF-14/RNF-08): só ação e data UTC. Sem IP, sem user agent, sem dado pessoal. Retenção: pendência jurídica.
export const ADMIN_ACOES = ["login", "logout", "export_auditoria", "export_leads"] as const;
export const adminEvents = pgTable(
  "admin_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    acao: text("acao").notNull(),
    criadoEm: agora(),
  },
  (t) => [check("admin_events_acao_ck", sql`${t.acao} in ('login','logout','export_auditoria','export_leads')`)],
);

// --- Better Auth (conferido contra o CLI em 2026-11-07; rateLimit mapeia a tabela física rate_limit_auth) ---
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  // 3ª camada do login: o admin nasce em create-admin.mjs (já em minúsculas); o cadastro público está desligado.
  check("user_email_ck", sql`char_length(${t.email}) <= 254 and ${t.email} = lower(${t.email}) and ${t.email} ~ '^[^@[:space:]]+@[^@[:space:]]+\\.[^@[:space:].]+$'`),
]);

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
}, (t) => [index("session_userId_idx").on(t.userId)]);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("account_userId_idx").on(t.userId)]);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("verification_identifier_idx").on(t.identifier)]);

export const rateLimit = pgTable("rate_limit_auth", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});
