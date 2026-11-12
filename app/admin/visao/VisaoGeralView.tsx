import Link from "next/link";
import type { VisaoGeral } from "../../_lib/admin/visao-geral-query";
import { amostraPequena, taxaConversao } from "../../_lib/admin/visao-geral";
import { FOCO } from "../ui";
import { Funil } from "./Funil";
import { GraficoSemanas } from "./GraficoSemanas";
import { ParaChamarLista } from "./ParaChamar";

const CARTAO = "flex min-h-11 flex-col gap-1 rounded-lg border-2 border-slate-300 bg-white p-4 text-slate-900";
const NUM = "text-4xl font-semibold leading-none";
const SUB = "text-sm text-(--mp-ink-muted)";

function Bloco({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  // div role=region, não <section>: `main section:not(.lp-hero)` do landing-v6.css afetaria o admin.
  return (
    <div role="region" aria-labelledby={id} className="mb-6">
      <h3 id={id} className="m-0 mb-3 font-[family-name:var(--font-display)] text-lg font-semibold">{titulo}</h3>
      {children}
    </div>
  );
}

export function VisaoGeralView({ dados, agora, ok }: { dados: VisaoGeral; agora: Date; ok?: string }) {
  const { total, porStatus, hoje, seteDias, novosHaMaisDe48h, semanas, chamar } = dados;
  const taxa = taxaConversao(porStatus.convertido, porStatus.nao_convertido);
  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {ok === "senha" && <p role="status" className="mb-3 rounded-md bg-green-100 p-3">Senha alterada. Os outros aparelhos foram desconectados.</p>}
      <h2 className="m-0 mb-4 font-[family-name:var(--font-display)] text-xl font-semibold">Visão geral</h2>

      {total === 0 ? (
        <p className="m-0 rounded-lg border border-dashed border-slate-400 bg-white p-6">
          Nenhum lead ainda. Quando alguém enviar o formulário da página, ele aparece aqui, com os números e o gráfico.
          Divulgue o link da página para começar.
        </p>
      ) : (
        <>
          {amostraPequena(total) && <p className="mb-4 mt-0 text-sm text-(--mp-ink-muted)">Com poucos leads, as tendências ainda não são confiáveis.</p>}

          <div className="mb-6 grid grid-cols-1 gap-3 min-[600px]:grid-cols-2 min-[1000px]:grid-cols-4">
            <div className={CARTAO}><span className={SUB}>Novos hoje</span><span className={NUM}>{hoje}</span><span className={SUB}>desde a meia-noite</span></div>
            <div className={CARTAO}><span className={SUB}>Novos nos últimos 7 dias</span><span className={NUM}>{seteDias}</span><span className={SUB}>incluindo hoje</span></div>
            <Link href="/admin/leads?status=novo&ordem=asc" prefetch={false} className={`${CARTAO} no-underline hover:border-slate-500 ${FOCO}`}>
              <span className={SUB}>Aguardando contato</span>
              <span className={NUM}>{porStatus.novo}</span>
              <span className={SUB}>{novosHaMaisDe48h > 0 ? `${novosHaMaisDe48h} há mais de 48 h` : "nenhum há mais de 48 h"} · ver lista</span>
            </Link>
            <div className={CARTAO}>
              <span className={SUB}>Taxa de conversão</span>
              {taxa.pct === null ? (
                <><span className="text-xl font-semibold leading-tight">Ainda sem dados suficientes</span><span className={SUB}>precisa de 5 leads com resultado ({taxa.decididos} até agora)</span></>
              ) : (
                <><span className={NUM}>{taxa.pct}%</span><span className={SUB}>{porStatus.convertido} convertidos de {taxa.decididos} com resultado</span></>
              )}
            </div>
          </div>

          <Bloco id="chamar-titulo" titulo="Para chamar agora"><ParaChamarLista itens={chamar} agora={agora} /></Bloco>

          <div className="grid gap-x-8 min-[1000px]:grid-cols-2">
            <Bloco id="semanas-titulo" titulo="Leads por semana"><GraficoSemanas semanas={semanas} /></Bloco>
            <Bloco id="funil-titulo" titulo="Leads por status"><Funil porStatus={porStatus} total={total} /></Bloco>
          </div>
        </>
      )}
    </main>
  );
}
