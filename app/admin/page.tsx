import Link from "next/link";
import { logoutAction } from "./actions";
import { requireSession } from "../_lib/session";
import { lerParams, POR_PAGINA, type ParamsLista } from "../_lib/admin/busca";
import { listarLeads, resumoPorStatus } from "../_lib/admin/leads-query";
import { STATUS, STATUS_ROTULO } from "../_lib/admin/status";

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";
const BOTAO = `inline-flex font-[inherit] no-underline text-slate-900 min-h-11 items-center justify-center rounded-md border border-slate-400 bg-white px-4 text-sm font-medium ${FOCO}`;
const CAMPO = `min-h-11 font-[inherit] text-slate-900 rounded-md border border-slate-400 bg-white px-3 ${FOCO}`;
const data = (d: Date) => d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

function href(p: ParamsLista, mudar: Partial<ParamsLista>) {
  const n = { ...p, ...mudar };
  const q = new URLSearchParams();
  if (n.q) q.set("q", n.q);
  if (n.status) q.set("status", n.status);
  if (n.ordem !== "desc") q.set("ordem", n.ordem);
  if (n.pagina > 1) q.set("pagina", String(n.pagina));
  const s = q.toString();
  return s ? `/admin?${s}` : "/admin";
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireSession();
  const raw = await searchParams;
  const p = lerParams(raw);
  const ok = raw.ok;
  const [{ total, linhas }, resumo] = await Promise.all([listarLeads(p), resumoPorStatus()]);
  const totalGeral = Object.values(resumo).reduce((a, b) => a + b, 0);
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const filtrando = Boolean(p.q || p.status);

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <h1 className="m-0 text-2xl font-semibold">Leads</h1>
        <form action={logoutAction}><button type="submit" className={BOTAO}>Sair</button></form>
      </header>

      {/* <a> e não <Link>: Link faria prefetch e dispararia o export (que grava registro). */}
      <nav aria-label="Auditoria e privacidade" className="mb-6 flex flex-wrap gap-3">
        <a href="/admin/auditoria.csv" download className={BOTAO}>Baixar auditoria (CSV)</a>
        <a href="/admin/decisoes-lgpd" download className={BOTAO}>Baixar documento LGPD</a>
      </nav>

      <nav aria-label="Resumo por status" className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STATUS.map((s) => (
          <Link key={s} href={href(p, { status: p.status === s ? undefined : s, pagina: 1 })} aria-current={p.status === s ? "true" : undefined}
            className={`flex min-h-11 flex-col justify-center rounded-md border px-3 py-2 no-underline text-slate-900 ${FOCO} ${p.status === s ? "border-blue-700 bg-blue-50" : "border-slate-300 bg-white"}`}>
            <span className="text-2xl font-semibold leading-tight">{resumo[s]}</span>
            <span className="text-sm">{STATUS_ROTULO[s]}</span>
          </Link>
        ))}
      </nav>

      <form method="get" action="/admin" role="search" className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
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
        <button type="submit" className={`${BOTAO} !bg-slate-900 !text-white`}>Filtrar</button>
      </form>

      {ok === "excluido" && <p role="status" className="mb-3 rounded-md bg-green-100 p-3">Lead excluído.</p>}
      <p role="status" className="m-0 mb-3 text-sm">{total} {total === 1 ? "lead" : "leads"}{filtrando ? " no filtro" : ""}</p>

      {linhas.length === 0 ? (
        <p className="m-0 rounded-md border border-dashed border-slate-400 p-6 text-center">
          {totalGeral === 0 ? "Nenhum lead ainda. Quando alguém enviar o formulário, aparece aqui."
            : <>Nenhum lead para este filtro. <Link href="/admin" className={`underline ${FOCO}`}>Limpar filtros</Link></>}
        </p>
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0">
          {linhas.map((l) => (
            <li key={l.id} className="rounded-md border border-slate-300 bg-white p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="m-0 flex break-words text-lg font-semibold"><Link href={`/admin/lead/${l.id}`} className={`inline-flex min-h-11 items-center no-underline text-slate-900 hover:underline ${FOCO}`}>{l.anonimizadoEm ? "Anonimizado" : l.nome}</Link></h2>
                <span className="rounded bg-slate-100 px-2 py-1 text-sm">{STATUS_ROTULO[l.status as keyof typeof STATUS_ROTULO] ?? l.status}</span>
              </div>
              {!l.anonimizadoEm && <p className="mt-1 break-words text-sm">{l.negocio} · {l.cidadeUf} · {l.whatsapp}</p>}
              <p className="mt-1 text-sm text-slate-600">Recebido em {data(l.criadoEm)}</p>
            </li>
          ))}
        </ul>
      )}

      {paginas > 1 && (
        <nav aria-label="Paginação" className="mt-6 flex items-center justify-between gap-3">
          {p.pagina > 1 ? <Link href={href(p, { pagina: p.pagina - 1 })} className={BOTAO}>Anterior</Link> : <span />}
          <span className="text-sm">Página {p.pagina} de {paginas}</span>
          {p.pagina < paginas ? <Link href={href(p, { pagina: p.pagina + 1 })} className={BOTAO}>Próxima</Link> : <span />}
        </nav>
      )}
    </main>
  );
}
