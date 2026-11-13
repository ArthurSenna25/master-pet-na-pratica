import Link from "next/link";
import type { ParamsLista } from "../../_lib/admin/busca";
import { STATUS, STATUS_ROTULO, type Status } from "../../_lib/admin/status";
import { Icone } from "../Icone";
import { hrefLeads } from "./href";

const ICONE: Record<Status, string> = { novo: "dot", em_contato: "phone", convertido: "check", nao_convertido: "x" };

/** Abas de status com contagem (links; clicar de novo no ativo volta a "Todos"). Ativa = aria-current + fundo navy (não só cor). */
export function PillsStatus({ p, resumo }: { p: ParamsLista; resumo: Record<Status, number> }) {
  const totalGeral = STATUS.reduce((a, s) => a + resumo[s], 0);
  return (
    <nav className="ad-pills" aria-label="Filtrar por status">
      <Link className={`ad-pill${p.status ? "" : " is-on"}`} href={hrefLeads(p, { status: undefined, pagina: 1 })} prefetch={false} aria-current={p.status ? undefined : "true"}>Todos<b>{totalGeral}</b></Link>
      {STATUS.map((s) => (
        <Link key={s} className={`ad-pill${p.status === s ? " is-on" : ""}`} href={hrefLeads(p, { status: p.status === s ? undefined : s, pagina: 1 })} prefetch={false}
          aria-current={p.status === s ? "true" : undefined}>
          <Icone nome={ICONE[s]} />{STATUS_ROTULO[s]}<b>{resumo[s]}</b>
        </Link>
      ))}
    </nav>
  );
}
