import Link from "next/link";
import { logoutAction } from "./actions";
import { requireSession } from "../_lib/session";
import { filtrosAtivos, lerParams, POR_PAGINA, type ParamsLista } from "../_lib/admin/busca";
import { listarLeads, resumoPorStatus } from "../_lib/admin/leads-query";
import { STATUS, STATUS_ROTULO } from "../_lib/admin/status";
import { linkWhatsapp } from "../_lib/admin/whatsapp";

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
  const ativos = filtrosAtivos(p);
  const filtrando = ativos.length > 0;

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <h1 className="m-0 text-2xl font-semibold">Leads</h1>
        <form action={logoutAction}><button type="submit" className={BOTAO}>Sair</button></form>
      </header>

      {/* <a> e não <Link>: Link faria prefetch e dispararia o export (que grava registro). */}
      <nav aria-label="Exportações e privacidade" className="mb-3 flex flex-wrap gap-3">
        <a href="/admin/leads.csv" download className={BOTAO}>Baixar leads (CSV)</a>
        <a href="/admin/auditoria.csv" download className={BOTAO}>Baixar auditoria (CSV)</a>
        <a href="/admin/decisoes-lgpd" download className={BOTAO}>Baixar documento LGPD</a>
      </nav>
      <p className="m-0 mb-6 text-sm text-slate-700">O CSV de leads contém dados pessoais; guarde o arquivo com cuidado.</p>

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
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <p role="status" className="m-0 text-sm">{total} {total === 1 ? "lead" : "leads"}{filtrando ? " no filtro" : ""}</p>
        {filtrando && <Link href="/admin" className={`inline-flex min-h-11 items-center text-sm underline text-blue-700 ${FOCO}`}>Limpar filtros</Link>}
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

      {linhas.length === 0 ? (
        <p className="m-0 rounded-md border border-dashed border-slate-400 p-6 text-center">
          {totalGeral === 0 ? "Nenhum lead ainda. Quando alguém enviar o formulário, aparece aqui."
            : "Nenhum lead para este filtro. Use “Limpar filtros” acima ou remova um filtro."}
        </p>
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0">
          {linhas.map((l) => {
            const wa = l.anonimizadoEm ? null : linkWhatsapp(l.whatsapp);
            return (
            <li key={l.id} className="relative rounded-md border border-slate-300 bg-white p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                {/* Um único link por lead: o ::after cobre o cartão inteiro; o aria-label substitui o texto (sem leitura duplicada). */}
                <Link href={`/admin/lead/${l.id}`} prefetch={false} aria-label={l.anonimizadoEm ? "Ver lead anonimizado" : `Ver lead ${l.nome}`}
                  className={`flex min-h-11 items-center gap-2 break-words text-lg font-semibold no-underline text-slate-900 after:absolute after:inset-0 after:content-[''] hover:underline ${FOCO} focus-visible:after:outline-2 focus-visible:after:outline-blue-700`}>
                  <span>{l.anonimizadoEm ? "Anonimizado" : l.nome}</span>
                  <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
                </Link>
                <span className="rounded bg-slate-100 px-2 py-1 text-sm">{STATUS_ROTULO[l.status as keyof typeof STATUS_ROTULO] ?? l.status}</span>
              </div>
              {!l.anonimizadoEm && <p className="mt-1 break-words text-sm">{l.negocio} · {l.cidadeUf} · {l.whatsapp}</p>}
              <p className="mt-1 text-sm text-slate-600">Recebido em {data(l.criadoEm)}</p>
              {wa && (
                <p className="relative z-10 m-0 mt-2 flex"><a href={wa} target="_blank" rel="noopener noreferrer" className={BOTAO}>Chamar no WhatsApp</a></p>
              )}
            </li>
            );
          })}
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
