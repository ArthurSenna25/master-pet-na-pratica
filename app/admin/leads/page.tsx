import Link from "next/link";
import { requireSession } from "../../_lib/session";
import { lerParams, POR_PAGINA } from "../../_lib/admin/busca";
import { listarLeads, resumoPorStatus } from "../../_lib/admin/leads-query";
import { Aviso } from "../Aviso";
import { Cabecalho } from "../Cabecalho";
import { LeadsLista } from "../LeadsLista";
import { BarraFiltros } from "./BarraFiltros";
import { BuscaLeads } from "./BuscaLeads";
import { EstadoVazio } from "./EstadoVazio";
import { hrefLeads } from "./href";
import { PillsStatus } from "./PillsStatus";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireSession();
  const raw = await searchParams;
  const p = lerParams(raw);
  const agora = new Date();
  const [{ total, linhas }, resumo] = await Promise.all([listarLeads(p), resumoPorStatus()]);
  const totalGeral = Object.values(resumo).reduce((a, b) => a + b, 0);
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <>
      <Cabecalho email={session.user.email} ativa="leads" />
      <main className="ad-main">
        {raw.ok === "excluido" && <Aviso tipo="ok">Lead excluído.</Aviso>}
        <div className="ad-pg-hd"><h1>Leads</h1></div>
        <PillsStatus p={p} resumo={resumo} />
        <BuscaLeads p={p} />
        <BarraFiltros p={p} total={total} />

        {linhas.length === 0 ? (
          <EstadoVazio totalGeral={totalGeral} />
        ) : (
          <LeadsLista linhas={linhas} agora={agora} />
        )}

        {paginas > 1 && (
          <nav className="ad-pager" aria-label="Paginação">
            {p.pagina > 1 ? <Link className="ad-btn ad-btn--secondary" href={hrefLeads(p, { pagina: p.pagina - 1 })} prefetch={false}>Anterior</Link> : <span />}
            <span className="ad-sub">Página {p.pagina} de {paginas}</span>
            {p.pagina < paginas ? <Link className="ad-btn ad-btn--secondary" href={hrefLeads(p, { pagina: p.pagina + 1 })} prefetch={false}>Próxima</Link> : <span />}
          </nav>
        )}
      </main>
    </>
  );
}
