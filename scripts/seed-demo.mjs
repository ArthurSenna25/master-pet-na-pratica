// Leads FICTÍCIOS só para ver o painel (screenshots, demonstração). Uso: `node scripts/seed-demo.mjs` (cria) · `node scripts/seed-demo.mjs --remover` (apaga).
// Só roda no branch de TESTE: usa SOMENTE o DATABASE_URL do .env.local (nunca o do ambiente) e aborta se houver qualquer lead que não seja deste seed
// ou se o host coincidir com o de DATABASE_URL_PROD (variável do ambiente, lida ao rodar). Marca: negócio "zz-teste-…" e origem "zz-demo-teste-…". Nada disso entra no código do app.
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";

const ORIGEM = "zz-demo-teste-";
const NEGOCIO = "zz-teste-";
const falhar = (msg) => { console.error(`ABORTADO: ${msg}`); process.exit(1); };

if (process.env.DATABASE_URL) falhar("DATABASE_URL já está definido no ambiente. Este script só usa o .env.local (branch de teste); rode sem ela no shell.");
if (process.env.NODE_ENV === "production") falhar("NODE_ENV=production.");
if (!existsSync(".env.local")) falhar(".env.local não encontrado.");
process.loadEnvFile(".env.local");
const url = process.env.DATABASE_URL;
if (!url) falhar("DATABASE_URL ausente no .env.local.");
const host = new URL(url).hostname;
// Host de produção: lido do AMBIENTE ao rodar (DATABASE_URL_PROD, nunca escrito no repositório nem impresso). Sem ela a trava de host não vale (as outras seguem).
const urlProd = process.env.DATABASE_URL_PROD;
if (urlProd) {
  let hostProd;
  try { hostProd = new URL(urlProd).hostname; } catch { falhar("DATABASE_URL_PROD inválida."); }
  if (hostProd === host) falhar("o host do .env.local é o de produção (DATABASE_URL_PROD).");
} else {
  console.warn("Aviso: DATABASE_URL_PROD não definida; a trava de host de produção não foi aplicada.");
}
// Defesa extra: se o .env.local aponta para um banco com leads reais, não mexe. (Origem http://localhost… = formulário local, só existe em teste; não é apagada.)
const sql = neon(url);

const [{ n: reais }] = await sql`select count(*)::int as n from lead where origem not like ${ORIGEM + "%"} and origem not like 'zz-teste-%' and origem not like 'http://localhost%'`;
if (reais > 0) falhar(`o banco tem ${reais} lead(s) que não são de teste. Não é o branch de teste (ou limpe antes).`);

if (process.argv.includes("--remover")) {
  const r = await sql`delete from lead where origem like ${ORIGEM + "%"} returning id`;
  console.log(`Removidos ${r.length} leads de demonstração.`);
  process.exit(0);
}

const dias = (n, h = 10) => new Date(Date.now() - n * 86_400_000 - (h - 10) * 3_600_000);
const DESAFIOS = ["Organização e processos", "Precificação e financeiro", "Equipe", "Atendimento e clientes", "Tudo isso junto"];
const TEMPOS = ["Menos de 1 ano", "1 a 3 anos", "3 a 5 anos", "Mais de 5 anos"];
const PESSOAS = ["Só eu", "2 a 3", "4 ou mais"];
const CIDADES = ["Lins/SP", "Bauru/SP", "Marília/SP", "Araçatuba/SP", "Penápolis/SP", "Birigui/SP"];
const NOMES = ["Ana Exemplo", "Bruno Exemplo", "Carla Exemplo", "Diego Exemplo", "Elisa Exemplo", "Fábio Exemplo", "Gabi Exemplo", "Hugo Exemplo", "Ivana Exemplo", "João Exemplo", "Karen Exemplo", "Lucas Exemplo", "Marta Exemplo", "Nuno Exemplo", "Olívia Exemplo", "Paulo Exemplo"];
// [dias atrás, status, anonimizado]
const PLANO = [
  [0.2, "novo"], [0.5, "novo"], [1, "novo"], [3, "novo"], [5, "novo"], [6, "novo"],
  [2, "em_contato"], [9, "em_contato"], [12, "convertido"], [16, "convertido"], [20, "nao_convertido"], [23, "convertido"],
  [27, "nao_convertido"], [31, "convertido"], [38, "nao_convertido"], [44, "nao_convertido", true],
];

const linhas = PLANO.map(([d, status, anon], i) => ({
  id: randomUUID(), nome: anon ? "" : NOMES[i], whatsapp: anon ? "" : `67999990${String(i).padStart(3, "0")}`,
  cidade: CIDADES[i % CIDADES.length], negocio: anon ? "" : `${NEGOCIO}Pet ${NOMES[i].split(" ")[0]}`,
  tempo: TEMPOS[i % TEMPOS.length], pessoas: PESSOAS[i % PESSOAS.length], desafio: DESAFIOS[i % DESAFIOS.length],
  mentoria: i % 5 === 0, status, criado: dias(d), anon: anon ? new Date() : null, origem: `${ORIGEM}${i}`,
}));

for (const l of linhas) {
  await sql`insert into lead (id, nome, whatsapp, cidade_uf, negocio, tempo_funcionamento, pessoas, maior_desafio, ja_fez_mentoria, status, origem, criado_em, anonimizado_em)
    values (${l.id}, ${l.nome}, ${l.whatsapp}, ${l.cidade}, ${l.negocio}, ${l.tempo}, ${l.pessoas}, ${l.desafio}, ${l.mentoria}, ${l.status}, ${l.origem}, ${l.criado.toISOString()}, ${l.anon?.toISOString() ?? null})`;
}
console.log(`Criados ${linhas.length} leads de demonstração (negócio "${NEGOCIO}…", origem "${ORIGEM}…"). Remova com: node scripts/seed-demo.mjs --remover`);
