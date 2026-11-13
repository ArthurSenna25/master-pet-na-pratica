import Link from "next/link";
import { filtrosAtivos, type ParamsLista } from "../../_lib/admin/busca";
import { Icone } from "../Icone";
import { hrefLeads } from "./href";

/** Contador "N leads", chips removíveis (links) e "Limpar filtros" (sempre visível enquanto houver filtro). */
export function BarraFiltros({ p, total }: { p: ParamsLista; total: number }) {
  const ativos = filtrosAtivos(p);
  const filtrando = ativos.length > 0;
  return (
    <div className="ad-bar2">
      <p className="ad-count" role="status"><b>{total}</b> {total === 1 ? "lead" : "leads"}{filtrando ? " no filtro" : ""}</p>
      {filtrando && (
        <>
          <ul className="ad-chips" aria-label="Filtros ativos">
            {ativos.map((f) => (
              <li key={f.id} className="ad-chip">
                {f.rotulo}
                <Link href={hrefLeads(p, f.limpar)} prefetch={false} aria-label={`Remover filtro: ${f.rotulo}`}><Icone nome="x" /></Link>
              </li>
            ))}
          </ul>
          <Link className="ad-link ad-clear" href="/admin/leads" prefetch={false}>Limpar filtros</Link>
        </>
      )}
    </div>
  );
}
