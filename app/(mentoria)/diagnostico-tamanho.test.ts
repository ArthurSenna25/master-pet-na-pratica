import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// O degrau largo do pin (util.ts: >=1091x590) foi medido com ESTE conteúdo do Diagnóstico: a 1366x768@125% (1093 px) a margem é de 2 px.
// Qualquer mudança no texto/estrutura do Diagnóstico ou nas regras de tamanho dele pode estourar o pin sem aviso. Este teste trava isso.
const DIAGNOSTICO = "app/(mentoria)/Diagnostico.tsx";
const CSS = "app/(mentoria)/mentoria.css";
// Última medição completa com `node qa/pin-matriz.mjs <url> ambos` (chromium e webkit) = tudo ok. Atualize o hash SÓ depois de rodar a matriz.
const HASH_MEDIDO = "282c5d159f4c0c5c";

const norm = (t: string): string => t.replace(/\r\n/g, "\n");
function hashDoDiagnostico(): string {
  const regrasDeTamanho = norm(readFileSync(CSS, "utf8")).split("\n").filter((l) => /^(\.nm\s)?\.nm-(diag|pick|picks|out|rail)\b/.test(l.trim())).join("\n");
  return createHash("sha256").update(norm(readFileSync(DIAGNOSTICO, "utf8"))).update("\n--css--\n").update(regrasDeTamanho).digest("hex").slice(0, 16);
}

describe("tamanho do Diagnóstico x degrau do pin", () => {
  it("o texto/CSS do Diagnóstico não mudou desde a última rodada da matriz do pin", () => {
    expect(
      hashDoDiagnostico(),
      [
        "O Diagnóstico (Diagnostico.tsx ou as regras .nm-diag/.nm-pick/.nm-out/.nm-rail em mentoria.css) mudou de conteúdo.",
        "Ele define a altura mínima do pin do Dia (a 1366x768@125% a margem é de só 2 px). Antes de seguir:",
        "1) npm run build; $env:MENTORIA_FORM_ATIVO=\"1\"; npx next start -p 3000;",
        "2) node qa/pin-matriz.mjs http://localhost:3000/mentoria ambos  (e as bordas: EXTRA_ONLY=1 EXTRA=1090x590,1091x590,900x640,1199x640 ...);",
        "3) se tudo ok, rode este teste, copie o hash 'received' para HASH_MEDIDO; se não, ajuste PIN_WIDE_*/PIN_MIN_* em app/(mentoria)/_fx/util.ts.",
      ].join("\n"),
    ).toBe(HASH_MEDIDO);
  });
});
