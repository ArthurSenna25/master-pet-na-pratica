// Cria (ou redefine a senha d)o admin único. Uso: ADMIN_EMAIL e ADMIN_PASSWORD no .env.local; `node scripts/create-admin.mjs`.
// Sem rota de cadastro. Não imprime senha nem hash.
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { hashPassword } from "better-auth/crypto";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!DATABASE_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Defina DATABASE_URL, ADMIN_EMAIL e ADMIN_PASSWORD no .env.local.");
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 12) {
  console.error("ADMIN_PASSWORD precisa ter ao menos 12 caracteres.");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const email = ADMIN_EMAIL.trim().toLowerCase();
const hash = await hashPassword(ADMIN_PASSWORD);

const outros = await sql`select id from "user" where email <> ${email} limit 1`;
if (outros.length) {
  console.error("Já existe outro usuário. Este sistema tem um único admin.");
  process.exit(1);
}

const existente = await sql`select id from "user" where email = ${email}`;
if (existente.length) {
  await sql`update account set password = ${hash}, updated_at = now() where user_id = ${existente[0].id} and provider_id = 'credential'`;
  console.log("Admin já existia: senha atualizada.");
} else {
  const id = randomUUID();
  await sql.transaction([
    sql`insert into "user" (id, name, email, email_verified) values (${id}, 'Admin', ${email}, true)`,
    sql`insert into account (id, account_id, provider_id, user_id, password) values (${randomUUID()}, ${id}, 'credential', ${id}, ${hash})`,
  ]);
  console.log("Admin criado.");
}
