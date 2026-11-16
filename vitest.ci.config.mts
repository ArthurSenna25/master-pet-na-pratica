import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// CI (proposta, docs/_projeto/ci/ci.proposta.yml): SÓ os testes que passam SEM DATABASE_URL e SEM .env.local (provado num clone limpo, sem
// as variáveis). Não carrega .env.local. Os testes de banco, de sessão e os e2e ficam fora (rodam localmente contra o branch teste do Neon).
export default defineConfig({
  resolve: { alias: { "server-only": fileURLToPath(new URL("./vitest.server-only.ts", import.meta.url)) } },
  test: {
    fileParallelism: false,
    testTimeout: 20_000,
    include: [
      "app/isolamento.test.ts",
      "app/_lib/client-boundary.test.ts",
      "app/_lib/consent-campanhas.test.ts",
      "app/_lib/mentoria-flag.test.ts",
      "app/_lib/lead-rules.test.ts",
      "app/_lib/rate-limit.test.ts",
      "app/_lib/unit.test.ts",
      "app/_lib/depoimentos.test.ts",
      "app/_lib/admin/{csv,filtros-ativos,formato,lead-edit,login-schema,perfil,senha-schema,visao-geral,whatsapp}.test.ts",
      "app/admin/actions.senha.test.ts",
      "app/admin/leads/estados.test.ts",
      "app/admin/visao/VisaoGeralView.test.ts",
      "app/(mentoria)/pagina.test.ts",
    ],
  },
});
