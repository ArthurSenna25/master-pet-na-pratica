import Link from "next/link";
import { logoutAction } from "./actions";
import { FechaMenus } from "./FechaMenus";
import { Icone } from "./Icone";

export type AbaAdmin = "visao" | "leads";

// Links de download são <a>, não <Link>: Link faria prefetch e dispararia o export (que grava registro).
function ItensExportar() {
  return (
    <>
      <a className="ad-mi" href="/admin/leads.csv" download><Icone nome="download" />Baixar leads (CSV)</a>
      <a className="ad-mi" href="/admin/auditoria.csv" download><Icone nome="download" />Baixar auditoria (CSV)</a>
      <a className="ad-mi" href="/admin/decisoes-lgpd" download><Icone nome="download" />Baixar documento LGPD</a>
      <p className="ad-mw"><Icone nome="alert" />O CSV de leads contém dados pessoais; guarde o arquivo com cuidado.</p>
    </>
  );
}

/** Cabeçalho compacto: marca + abas + (≥ 1000 px) Exportar, e-mail, Alterar senha, Sair; abaixo disso tudo dentro de "Menu". */
export function Cabecalho({ email, ativa }: { email: string; ativa: AbaAdmin }) {
  const aba = (id: AbaAdmin, href: string, texto: string) => (
    <Link className="ad-tab" href={href} prefetch={false} aria-current={ativa === id ? "page" : undefined}>{texto}</Link>
  );
  return (
    <header className="ad-hd">
      <div className="ad-hd__in">
        <Link className="ad-brand" href="/admin" prefetch={false} aria-label="Painel — início"><small>Master Pet</small><b>Painel</b></Link>
        <nav className="ad-tabs" aria-label="Seções do painel">{aba("visao", "/admin", "Visão geral")}{aba("leads", "/admin/leads", "Leads")}</nav>
        <div className="ad-hd__wide">
          <details className="ad-dd">
            <summary className="ad-btn ad-btn--onnavy">Exportar<Icone nome="chev" /></summary>
            <div className="ad-dd__p"><ItensExportar /></div>
          </details>
          {/* E-mail só renderizado (nunca logado); data-admin-email serve para cobri-lo em screenshots. */}
          <span className="ad-mail" data-admin-email>{email}</span>
          <Link className="ad-btn ad-btn--onnavy" href="/admin/senha" prefetch={false}>Alterar senha</Link>
          <form action={logoutAction}><button type="submit" className="ad-btn ad-btn--onnavy">Sair</button></form>
        </div>
        <details className="ad-dd ad-hd__narrow">
          <summary className="ad-btn ad-btn--onnavy" aria-label="Menu"><Icone nome="menu" /><span>Menu</span></summary>
          <div className="ad-dd__p">
            <p className="ad-mail ad-mail--in" data-admin-email>{email}</p>
            <p className="ad-mh">Exportar</p>
            <ItensExportar />
            <hr />
            <Link className="ad-mi" href="/admin/senha" prefetch={false}><Icone nome="lock" />Alterar senha</Link>
            <form action={logoutAction}><button type="submit" className="ad-mi">Sair</button></form>
          </div>
        </details>
      </div>
      <FechaMenus />
    </header>
  );
}
