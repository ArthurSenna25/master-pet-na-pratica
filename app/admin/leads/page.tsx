import Link from "next/link";
import { requireSession } from "../../_lib/session";
import { filtrosAtivos, lerParams, POR_PAGINA, type ParamsLista } from "../../_lib/admin/busca";
import { listarLeads, resumoPorStatus } from "../../_lib/admin/leads-query";
import { STATUS, STATUS_ROTULO } from "../../_lib/admin/status";
import { LeadsLista } from "../LeadsLista";
import { Cabecalho } from "../Cabecalho";
import { BOTAO, CAMPO, FOCO, SeloStatus } from "../ui";

function href(p: ParamsLista, mudar: Partial<ParamsLista>) {
  const n = { ...p, ...mudar };
  const q = new URLSearchParams();
  if (n.q) q.set("q", n.q);
  if (n.status) q.set("status", n.status);
  if (n.ordem !== "desc") q.set("ordem", n.ordem);
  if (n.pagina > 1) q.set("pagina", String(n.pagina));
  const s = q.toString();
  return s ? `/admin/leads?${s}` : "/admin/leads";
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireSession();
  const raw = await searchParams;
  const p = lerParams(raw);
  const ok = raw.ok;
  const [{ total, linhas }, resumo] = await Promise.all([listarLeads(p), resumoPorStatus()]);
  const totalGeral = Object.values(resumo).reduce((a, b) => a + b, 0);
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const ativos = filtrosAtivos(p);
  const filtrando = ativos.length > 0;

  return (
    <>
      <Cabecalho email={session.user.email} ativa="leads" />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="m-0 mb-4 font-[family-name:var(--font-display)] text-xl font-semibold">Leads</h2>
        <nav aria-label="Resumo por status" className="mb-6 grid grid-cols-2 gap-3 min-[900px]:grid-cols-4">
          {STATUS.map((s) => (
            <Link key={s} href={href(p, { status: p.status === s ? undefined : s, pagina: 1 })} aria-current={p.status === s ? "true" : undefined}
              aria-label={`${STATUS_ROTULO[s]}: ${resumo[s]}`}
              className={`flex min-h-11 flex-col items-start gap-2 rounded-lg border-2 px-4 py-3 no-underline text-slate-900 hover:border-slate-500 ${FOCO} ${p.status === s ? "border-blue-700 bg-blue-50" : "border-slate-300 bg-white"}`}>
              <span aria-hidden="true" className="text-3xl font-semibold leading-none">{resumo[s]}</span>
              <span aria-hidden="true"><SeloStatus status={s} /></span>
            </Link>
          ))}
        </nav>

        <div className="mb-6 rounded-lg border border-slate-300 bg-white p-4">
          <form method="get" action="/admin/leads" role="search" className="grid gap-3 min-[900px]:grid-cols-[1fr_auto_auto_auto] min-[900px]:items-end">
            <label className="grid gap-1 text-sm">Buscar (nome, negócio, cidade ou telefone)
              <input name="q" defaultValue={p.q} maxLength={100} className={CAMPO} />
            </label>
            <label className="grid gap-1 text-sm">Status
              <select name="status" defaultValue={p.status ?? ""} className={CAMPO}>
                <option value="">Todos</option>
                {STATUS.map((s) => <option key={s} value={s}>{STATUS_ROTULO[s]}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm">Ordem
              <select name="ordem" defaultValue={p.ordem} className={CAMPO}>
                <option value="desc">Mais recentes</option>
                <option value="asc">Mais antigos</option>
              </select>
            </label>
            <button type="submit" className={`${BOTAO} !border-(--mp-navy-900) !bg-(--mp-navy-900) !text-(--mp-beige-50)`}>Filtrar</button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-200 pt-3">
            <p role="status" className="m-0 text-sm">{total} {total === 1 ? "lead" : "leads"}{filtrando ? " no filtro" : ""}</p>
            {filtrando && <Link href="/admin/leads" className={`inline-flex min-h-11 items-center text-sm underline text-blue-700 ${FOCO}`}>Limpar filtros</Link>}
            {filtrando && (
              <ul aria-label="Filtros ativos" className="m-0 flex list-none flex-wrap gap-2 p-0">
                {ativos.map((f) => (
                  <li key={f.id}>
                    <Link href={href(p, f.limpar)} aria-label={`Remover filtro: ${f.rotulo}`} className={`inline-flex min-h-11 max-w-full items-center gap-2 break-all rounded-full border border-slate-400 bg-white px-3 text-sm no-underline text-slate-900 ${FOCO}`}>
                      <span>{f.rotulo}</span><span aria-hidden="true">×</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {ok === "excluido" &&<p role="status" className="mb-3 rounded-md bg-green-100 p-3">Lead excluído.</p>}

        {linhas.length === 0 ? (
          <p className="m-0 rounded-lg border border-dashed border-slate-400 bg-white p-6 text-center">
            {totalGeral === 0 ? "Nenhum lead ainda. Quando alguém enviar o formulário, aparece aqui."
              : "Nenhum lead para este filtro. Use “Limpar filtros” acima ou remova um filtro."}
          </p>
        ) : (
          <LeadsLista linhas={linhas} />
        )}

        {paginas > 1 && (
          <nav aria-label="Paginação" className="mt-6 flex items-center justify-between gap-3">
            {p.pagina > 1 ? <Link href={href(p, { pagina: p.pagina - 1 })} className={BOTAO}>Anterior</Link> : <span />}
            <span className="text-sm">Página {p.pagina} de {paginas}</span>
            {p.pagina < paginas ? <Link href={href(p, { pagina: p.pagina + 1 })} className={BOTAO}>Próxima</Link> : <span />}
          </nav>
        )}
      </main>
    </>
  );
}
