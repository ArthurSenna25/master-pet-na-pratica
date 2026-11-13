import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { formatarWhatsapp, dataHora, soHora } from "../../../_lib/admin/formato";
import { idSchema, OBSERVACAO_MAX } from "../../../_lib/admin/lead-edit";
import { haQuanto } from "../../../_lib/admin/visao-geral";
import { linkWhatsapp } from "../../../_lib/admin/whatsapp";
import { getDb } from "../../../_lib/db";
import { lead } from "../../../_lib/db/schema";
import { atualizarLeadAction } from "../../lead-actions";
import { Aviso } from "../../Aviso";
import { BotaoWhatsapp } from "../../BotaoWhatsapp";
import { Cabecalho } from "../../Cabecalho";
import { Icone } from "../../Icone";
import { SeloStatus } from "../../SeloStatus";
import { BarraSalvar } from "./BarraSalvar";
import { BlocoLgpd } from "./BlocoLgpd";
import { BotaoFechar } from "./BotaoFechar";
import { CampoObservacao } from "./CampoObservacao";
import { ConfirmacaoLgpd } from "./ConfirmacaoLgpd";
import { SeletorStatus } from "./SeletorStatus";

type Busca = Record<string, string | string[] | undefined>;
const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/**
 * Conteúdo único do lead (página direta e modal; só muda o invólucro). Quem chama faz requireSession() ANTES de renderizar isto.
 * `email` só é usado na página direta (cabeçalho). No modal, `modal` troca o título para h2 e o "voltar" por Fechar.
 */
export async function LeadDetalhe({ params, searchParams, modal = false, email }: { params: Promise<{ id: string }>; searchParams: Promise<Busca>; modal?: boolean; email?: string }) {
  const parsed = idSchema.safeParse(await params);
  if (!parsed.success) notFound();
  const [l] = await getDb().select().from(lead).where(eq(lead.id, parsed.data.id));
  if (!l) notFound();
  const q = await searchParams;
  const confirmar = um(q.confirmar);
  const anon = l.anonimizadoEm !== null;
  const nome = anon ? "Lead anonimizado" : l.nome;
  const base = `/admin/lead/${l.id}`;
  const wa = anon ? null : linkWhatsapp(l.whatsapp); // montado no servidor; nunca para lead anonimizado
  const tipoConfirmacao = confirmar === "excluir" ? "excluir" : confirmar === "anonimizar" && !anon ? "anonimizar" : null;
  const Titulo = modal ? "h2" : "h1";
  const agora = new Date();
  const ok = um(q.ok);

  // Mensagem de confirmação: um único role=status por vez. "Salvo" fica na barra de salvar (com a hora); as demais no topo.
  const confirmacaoSalvo = ok === "salvo"
    ? <><p role="status" className="ad-saved"><span><Icone nome="check" />Alterações salvas.</span></p><span className="ad-saved__t">às {soHora(l.atualizadoEm)}</span></>
    : null;
  const avisoTopo = (
    <>
      {ok === "anonimizado" && <Aviso tipo="ok">Dados pessoais anonimizados.</Aviso>}
      {um(q.erro) && <Aviso tipo="erro">Não foi possível salvar. A observação pode ter até {OBSERVACAO_MAX} caracteres.</Aviso>}
    </>
  );

  const cabecalhoLead = (
    <div className="ad-dlg__hd">
      <div>
        <p className="ad-eyebrow">Lead</p>
        <Titulo className="ad-dlg__t" id="lead-titulo">{nome}</Titulo>
        <p className="ad-sub">Recebido em {dataHora(l.criadoEm)} · {haQuanto(l.criadoEm, agora)}</p>
      </div>
      <div className="ad-dlg__hr">
        <SeloStatus status={l.status} />
        {modal ? <BotaoFechar /> : <Link className="ad-link" href="/admin/leads" prefetch={false}>← Voltar para a lista</Link>}
      </div>
    </div>
  );

  const confirmacao = tipoConfirmacao ? <ConfirmacaoLgpd tipo={tipoConfirmacao} id={l.id} nome={nome} criadoEm={l.criadoEm} base={base} modal={modal} /> : null;
  const corpo = confirmacao ? (
    <div className="ad-lf__g">{confirmacao}</div>
  ) : anon ? (
    <>
      <div className="ad-lf__g"><div>{avisoTopo}<p className="ad-sub">Os dados pessoais deste lead foram apagados. Não há o que editar nem a quem chamar; ele segue contando nos números.</p></div></div>
      <BlocoLgpd base={base} modal={modal} anonimizado />
    </>
  ) : (
    <form className="ad-lf" action={atualizarLeadAction}>
      <input type="hidden" name="id" value={l.id} />
      <div className="ad-lf__g">
        <div className="ad-lf__l">
          {avisoTopo}
          <h3 className="ad-h3">Dados</h3>
          <dl className="ad-dl">
            {([
              ["Negócio", l.negocio], ["Cidade/UF", l.cidadeUf], ["WhatsApp", formatarWhatsapp(l.whatsapp)], ["Tempo de funcionamento", l.tempoFuncionamento],
              ["Pessoas na equipe", l.pessoas], ["Maior desafio", l.maiorDesafio], ["Já fez mentoria?", l.jaFezMentoria ? "Sim" : "Não"],
            ] as const).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
          {l.mensagem && <div className="ad-msg"><p className="ad-msg__l">Mensagem</p><blockquote>{l.mensagem}</blockquote></div>}
          <div className="ad-orig"><span>Origem</span> {l.origem}</div>
        </div>
        <div className="ad-lf__r">
          {wa && <BotaoWhatsapp href={wa} nome={l.nome} grande />}
          <SeletorStatus atual={l.status} />
          <CampoObservacao inicial={l.observacao ?? ""} />
        </div>
      </div>
      <BlocoLgpd base={base} modal={modal} anonimizado={false} />
      <BarraSalvar confirmacao={confirmacaoSalvo} />
    </form>
  );

  if (modal) {
    return (
      <div className="ad-dlg">
        {cabecalhoLead}
        {corpo}
      </div>
    );
  }
  // Página direta: confirmação em tela estreita (como no handoff); o resto em página cheia, sem role=dialog.
  if (confirmacao) {
    return (
      <>
        {email && <Cabecalho email={email} ativa="leads" />}
        <main className="ad-main ad-main--narrow">
          <p className="ad-crumb"><Link href={base} prefetch={false}>← Voltar para {nome}</Link></p>
          {confirmacao}
        </main>
      </>
    );
  }
  return (
    <>
      {email && <Cabecalho email={email} ativa="leads" />}
      <main className="ad-main ad-main--lead">
        <article className="ad-dlg ad-dlg--page" aria-labelledby="lead-titulo">
          {cabecalhoLead}
          {corpo}
        </article>
      </main>
    </>
  );
}
