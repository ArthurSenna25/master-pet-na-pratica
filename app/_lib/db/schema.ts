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
  (t) => [check("lead_status_ck", sql`${t.status} in ('novo','em_contato','convertido','nao_convertido')`)],
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

// Sem FK e sem dado pessoal: sobrevive à exclusão do lead. Retenção: pendência jurídica.
export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  acao: text("acao").notNull(),
  leadId: uuid("lead_id").notNull(),
  criadoEm: agora(),
});

// --- Better Auth (formato padrão; conferido contra o CLI no commit 2) ---
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

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
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const rateLimit = pgTable("rate_limit_auth", {
  id: text("id").primaryKey(),
  key: text("key").notNull(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});
