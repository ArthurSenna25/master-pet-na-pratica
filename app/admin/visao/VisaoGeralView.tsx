import type { GrupoPerfil } from "../../_lib/admin/perfil";
import { AMOSTRA_MIN, esteVsPassada, janelaGrafico, taxaConversao } from "../../_lib/admin/visao-geral";
import type { VisaoGeral } from "../../_lib/admin/visao-geral-query";
import { vars } from "../../_components/vars";
import { Aviso } from "../Aviso";
import { Icone } from "../Icone";
import { Funil } from "./Funil";
import { GraficoSemanas } from "./GraficoSemanas";
import { Kpi } from "./Kpi";
import { ParaChamarLista } from "./ParaChamar";
import { PerfilLeads } from "./PerfilLeads";

const LISTA_AGUARDANDO = "/admin/leads?status=novo&ordem=asc";

/** Visão geral. Todos os números vêm prontos de `dados` (servidor); aqui só marcação. Mostra a tela inteira também com 0 leads. */
export function VisaoGeralView({ dados, perfil = [], agora, ok }: { dados: VisaoGeral; perfil?: GrupoPerfil[]; agora: Date; ok?: string }) {
  const { total, porStatus, hoje, seteDias, novosHaMaisDe48h, semanas, chamar } = dados;
  const taxa = taxaConversao(porStatus.convertido, porStatus.nao_convertido);
  const grafico = janelaGrafico(semanas, total);
  const { atual, passada, delta } = esteVsPassada(grafico);
  const sinal = delta > 0 ? `+${delta}` : String(delta);
  return (
    <main className="ad-main">
      {ok === "senha" && <Aviso tipo="ok"><b>Senha alterada.</b> Os outros aparelhos foram desconectados.</Aviso>}
      <div className="ad-pg-hd"><h1>Visão geral</h1></div>
      {total < AMOSTRA_MIN && <p className="ad-note"><Icone nome="info" />Com poucos leads, as tendências ainda não são confiáveis.</p>}

      <div className="ad-kpis">
        <Kpi i={0} rotulo="Novos hoje" numero={hoje} sub="desde a meia-noite" />
        <Kpi i={1} rotulo="Novos nos últimos 7 dias" numero={seteDias} sub="incluindo hoje" />
        <Kpi i={2} href={LISTA_AGUARDANDO} rotulo="Aguardando contato" numero={porStatus.novo}
          sub={novosHaMaisDe48h > 0 ? <><Icone nome="alert" />{novosHaMaisDe48h} há mais de 48 h</> : "nenhum há mais de 48 h"} />
        <Kpi i={3} rotulo="Taxa de conversão" semDados="Ainda sem dados suficientes"
          numero={taxa.pct === null ? null : `${taxa.pct}%`}
          sub={taxa.pct === null ? `Precisa de 5 leads com resultado (${taxa.decididos} até agora)` : `${porStatus.convertido} de ${taxa.decididos} leads com resultado`} />
      </div>

      <div className="ad-g2">
        <section className="ad-card ad-in" style={vars({ "--i": 3 })} aria-labelledby="visao-call">
          <div className="ad-card__h"><h2 id="visao-call">Para chamar agora</h2><p className="ad-sub">Os mais antigos primeiro</p></div>
          <ParaChamarLista itens={chamar} agora={agora} totalAguardando={porStatus.novo} semLeads={total === 0} />
        </section>
        <section className="ad-card ad-in" style={vars({ "--i": 4 })} aria-labelledby="visao-fn">
          <div className="ad-card__h"><h2 id="visao-fn">Leads por status</h2></div>
          <Funil porStatus={porStatus} total={total} />
        </section>
      </div>

      <section className="ad-card ad-in" style={vars({ "--i": 9 })} aria-labelledby="visao-ch">
        <div className="ad-card__h">
          <div>
            <h2 id="visao-ch">Leads por semana</h2>
            <p className="ad-sub">Esta semana: <b>{atual}</b> · semana passada: <b>{passada}</b> ({sinal})</p>
          </div>
        </div>
        <GraficoSemanas semanas={grafico} />
      </section>

      <PerfilLeads grupos={perfil} total={total} />
    </main>
  );
}
