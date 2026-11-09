import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireSession } from "../../../_lib/session";
import { getDb } from "../../../_lib/db";
import { lead } from "../../../_lib/db/schema";
import { idSchema, OBSERVACAO_MAX } from "../../../_lib/admin/lead-edit";
import { STATUS, STATUS_ROTULO } from "../../../_lib/admin/status";
import { anonimizarLeadAction, atualizarLeadAction, excluirLeadAction } from "../../lead-actions";

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";
const BOTAO = `inline-flex min-h-11 items-center justify-center rounded-md border border-slate-400 bg-white px-4 text-sm font-medium font-[inherit] no-underline text-slate-900 ${FOCO}`;
const PERIGO = `inline-flex min-h-11 items-center justify-center rounded-md border border-red-700 bg-red-700 px-4 text-sm font-medium font-[inherit] text-white ${FOCO}`;
const CAMPO = `box-border min-h-11 w-full rounded-md border border-slate-400 bg-white px-3 font-[inherit] text-slate-900 ${FOCO}`;
const data = (d: Date) => d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

type Busca = Record<string, string | string[] | undefined>;
const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function LeadPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Busca> }) {
  await requireSession();
  const parsed = idSchema.safeParse(await params);
  if (!parsed.success) notFound();
  const [l] = await getDb().select().from(lead).where(eq(lead.id, parsed.data.id));
  if (!l) notFound();
  const q = await searchParams;
  const confirmar = um(q.confirmar);
  const anon = l.anonimizadoEm !== null;
  const base = `/admin/lead/${l.id}`;

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <p className="m-0 mb-4 flex"><Link href="/admin" className={BOTAO}>← Voltar à lista</Link></p>
      <h1 className="m-0 break-words text-2xl font-semibold">{anon ? "Lead anonimizado" : l.nome}</h1>
      <p className="m-0 mt-1 text-sm text-slate-600">Recebido em {data(l.criadoEm)}</p>

      {um(q.ok) === "salvo" && <p role="status" className="mt-4 rounded-md bg-green-100 p-3">Alterações salvas.</p>}
      {um(q.ok) === "anonimizado" && <p role="status" className="mt-4 rounded-md bg-green-100 p-3">Dados pessoais anonimizados.</p>}
      {um(q.erro) && <p role="alert" className="mt-4 rounded-md bg-red-100 p-3">Não foi possível salvar. A observação pode ter até {OBSERVACAO_MAX} caracteres.</p>}

      {!anon && (
        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          {([
            ["Negócio", l.negocio], ["Cidade", l.cidadeUf], ["WhatsApp", l.whatsapp], ["Tempo de funcionamento", l.tempoFuncionamento],
            ["Pessoas na equipe", l.pessoas], ["Maior desafio", l.maiorDesafio], ["Já fez mentoria", l.jaFezMentoria ? "Sim" : "Não"],
          ] as const).map(([k, v]) => (
            <div key={k}><dt className="text-slate-600">{k}</dt><dd className="m-0 break-words font-medium">{v}</dd></div>
          ))}
          {l.mensagem && <div className="sm:col-span-2"><dt className="text-slate-600">Mensagem</dt><dd className="m-0 whitespace-pre-wrap break-words">{l.mensagem}</dd></div>}
        </dl>
      )}

      {!anon && (
        <form action={atualizarLeadAction} className="mt-8 grid gap-4">
          <input type="hidden" name="id" value={l.id} />
          <label className="grid gap-1 text-sm">Status
            <select name="status" defaultValue={l.status} className={CAMPO}>
              {STATUS.map((s) => <option key={s} value={s}>{STATUS_ROTULO[s]}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm">Observação (até {OBSERVACAO_MAX} caracteres)
            <textarea name="observacao" defaultValue={l.observacao ?? ""} maxLength={OBSERVACAO_MAX} rows={5} className={`${CAMPO} py-2`} />
          </label>
          <div className="flex"><button type="submit" className={`${BOTAO} !bg-slate-900 !text-white`}>Salvar</button></div>
        </form>
      )}

      <div role="region" aria-labelledby="zona" className="mt-10 border-t border-slate-300 pt-6">
        <h2 id="zona" className="m-0 text-lg font-semibold">Privacidade (LGPD)</h2>

        {confirmar === "anonimizar" && !anon ? (
          <div role="alertdialog" aria-labelledby="t-anon" aria-describedby="d-anon" className="mt-4 rounded-md border border-red-700 bg-white p-4">
            <h3 id="t-anon" className="m-0 text-base font-semibold">Anonimizar este lead?</h3>
            <p id="d-anon" className="mt-2">Nome, WhatsApp, negócio, mensagem e observação serão apagados e não podem ser recuperados. O registro do consentimento é mantido, sem IP e sem navegador.</p>
            <form action={anonimizarLeadAction} className="flex flex-wrap gap-3">
              <input type="hidden" name="id" value={l.id} />
              <input type="hidden" name="confirmar" value="sim" />
              <button type="submit" className={PERIGO}>Sim, anonimizar</button>
              <Link href={base} className={BOTAO}>Cancelar</Link>
            </form>
          </div>
        ) : confirmar === "excluir" ? (
          <div role="alertdialog" aria-labelledby="t-del" aria-describedby="d-del" className="mt-4 rounded-md border border-red-700 bg-white p-4">
            <h3 id="t-del" className="m-0 text-base font-semibold">Excluir este lead?</h3>
            <p id="d-del" className="mt-2">O lead e o registro do consentimento serão apagados para sempre. Fica só uma linha na auditoria, sem dado pessoal.</p>
            <form action={excluirLeadAction} className="flex flex-wrap gap-3">
              <input type="hidden" name="id" value={l.id} />
              <input type="hidden" name="confirmar" value="sim" />
              <button type="submit" className={PERIGO}>Sim, excluir</button>
              <Link href={base} className={BOTAO}>Cancelar</Link>
            </form>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            {!anon && <Link href={`${base}?confirmar=anonimizar`} className={BOTAO}>Anonimizar…</Link>}
            <Link href={`${base}?confirmar=excluir`} className={BOTAO}>Excluir…</Link>
          </div>
        )}
      </div>
    </main>
  );
}
