import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "../../../_lib/db";
import { lead } from "../../../_lib/db/schema";
import { idSchema, OBSERVACAO_MAX } from "../../../_lib/admin/lead-edit";
import { STATUS, STATUS_ROTULO } from "../../../_lib/admin/status";
import { linkWhatsapp } from "../../../_lib/admin/whatsapp";
import { anonimizarLeadAction, atualizarLeadAction, excluirLeadAction } from "../../lead-actions";

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";
const BOTAO = `inline-flex min-h-11 items-center justify-center rounded-md border border-slate-400 bg-white px-4 text-sm font-medium font-[inherit] no-underline text-slate-900 ${FOCO}`;
const PERIGO = `inline-flex min-h-11 items-center justify-center rounded-md border border-red-700 bg-red-700 px-4 text-sm font-medium font-[inherit] text-white ${FOCO}`;
const CAMPO = `box-border min-h-11 w-full rounded-md border border-slate-400 bg-white px-3 font-[inherit] text-slate-900 ${FOCO}`;
const data = (d: Date) => d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

/** No modal: Link (soft nav, intercepta). Na página direta: <a>, senão a navegação suave abriria o modal por cima da página. */
function Nav({ modal, href, children }: { modal: boolean; href: string; children: React.ReactNode }) {
  return modal
    ? <Link replace prefetch={false} href={href} className={BOTAO}>{children}</Link>
    : <a href={href} className={BOTAO}>{children}</a>;
}

type Busca = Record<string, string | string[] | undefined>;
const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Conteúdo único do lead (página direta e modal). Quem chama faz requireSession() ANTES de renderizar isto. */
export async function LeadDetalhe({ params, searchParams, modal = false }: { params: Promise<{ id: string }>; searchParams: Promise<Busca>; modal?: boolean }) {
  const parsed = idSchema.safeParse(await params);
  if (!parsed.success) notFound();
  const [l] = await getDb().select().from(lead).where(eq(lead.id, parsed.data.id));
  if (!l) notFound();
  const q = await searchParams;
  const confirmar = um(q.confirmar);
  const anon = l.anonimizadoEm !== null;
  const Titulo = modal ? "h2" : "h1";
  const base = `/admin/lead/${l.id}`;
  const wa = anon ? null : linkWhatsapp(l.whatsapp); // montado no servidor; nunca para lead anonimizado

  return (
    <>
      <Titulo id="lead-titulo" className="m-0 break-words text-2xl font-semibold">{anon ? "Lead anonimizado" : l.nome}</Titulo>
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

      {wa && <p className="m-0 mt-6 flex"><a href={wa} target="_blank" rel="noopener noreferrer" className={BOTAO}>Chamar no WhatsApp</a></p>}

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
              <Nav modal={modal} href={base}>Cancelar</Nav>
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
              <Nav modal={modal} href={base}>Cancelar</Nav>
            </form>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            {!anon && <Nav modal={modal} href={`${base}?confirmar=anonimizar`}>Anonimizar…</Nav>}
            <Nav modal={modal} href={`${base}?confirmar=excluir`}>Excluir…</Nav>
          </div>
        )}
      </div>
    </>
  );
}
