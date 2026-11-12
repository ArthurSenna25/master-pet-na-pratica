import Link from "next/link";
import { logoutAction } from "./actions";

// Botões sobre o cabeçalho navy: borda e texto beige (16,4:1), foco ouro (8,1:1).
const BOTAO_NAVY = "inline-flex font-[inherit] leading-6 no-underline min-h-11 items-center justify-center rounded-md border border-(--mp-beige-200)/60 bg-transparent px-4 text-sm font-medium !text-(--mp-beige-50) hover:bg-(--mp-navy-700) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mp-gold-400)";

// Item do menu Exportar (sobre navy-800): texto beige-50, foco ouro.
const ITEM_MENU = "flex min-h-11 items-center rounded px-3 text-sm no-underline !text-(--mp-beige-50) hover:bg-(--mp-navy-700) focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-(--mp-gold-400)";

// Aba ativa = fundo navy-700 + sublinhado (não só cor); foco ouro.
const ABA = "inline-flex min-h-11 items-center px-3 text-base font-medium no-underline !text-(--mp-beige-50) border-b-4 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-(--mp-gold-400)";

export type AbaAdmin = "visao" | "leads";

export function Cabecalho({ email, ativa }: { email: string; ativa: AbaAdmin }) {
  const aba = (id: AbaAdmin) => `${ABA} ${ativa === id ? "border-(--mp-gold-400) bg-(--mp-navy-700)" : "border-transparent hover:bg-(--mp-navy-800)"}`;
  return (
    <header className="bg-(--mp-navy-900) text-(--mp-beige-50)">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h1 className="m-0 font-[family-name:var(--font-display)] text-2xl font-semibold !text-(--mp-beige-50)">Painel</h1>
          {/* E-mail só renderizado (nunca logado); data-admin-email serve para cobri-lo em screenshots. */}
          <p data-admin-email className="m-0 break-all text-sm text-(--mp-beige-200)">{email}</p>
        </div>
        <nav aria-label="Seções do painel" className="mt-2 flex flex-wrap gap-1">
          <Link href="/admin" prefetch={false} aria-current={ativa === "visao" ? "page" : undefined} className={aba("visao")}>Visão geral</Link>
          <Link href="/admin/leads" prefetch={false} aria-current={ativa === "leads" ? "page" : undefined} className={aba("leads")}>Leads</Link>
        </nav>
        <nav aria-label="Conta e exportações" className="mt-3 flex flex-wrap items-start gap-3">
          {/* details nativo: abre por teclado (Enter/Espaço) e sem JS. Links são <a>, não <Link>: Link faria prefetch e dispararia o export (que grava registro). */}
          <details className="group relative">
            <summary className={`${BOTAO_NAVY} cursor-pointer list-none gap-2 [&::-webkit-details-marker]:hidden group-open:bg-(--mp-navy-700)`}>
              Exportar <span aria-hidden="true" className="inline-block text-xs group-open:rotate-180">▾</span>
            </summary>
            <div className="absolute left-0 z-10 mt-2 grid w-72 max-w-[calc(100vw-2rem)] gap-1 rounded-md border border-(--mp-beige-200)/60 bg-(--mp-navy-800) p-2">
              <a href="/admin/leads.csv" download className={ITEM_MENU}>Baixar leads (CSV)</a>
              <a href="/admin/auditoria.csv" download className={ITEM_MENU}>Baixar auditoria (CSV)</a>
              <a href="/admin/decisoes-lgpd" download className={ITEM_MENU}>Baixar documento LGPD</a>
              <p className="m-0 px-3 pb-1 pt-2 text-sm text-(--mp-beige-200)">O CSV de leads contém dados pessoais; guarde o arquivo com cuidado.</p>
            </div>
          </details>
          <Link href="/admin/senha" prefetch={false} className={BOTAO_NAVY}>Alterar senha</Link>
          <form action={logoutAction}><button type="submit" className={BOTAO_NAVY}>Sair</button></form>
        </nav>
      </div>
    </header>
  );
}
