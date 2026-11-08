import type { ReactNode } from "react";
import Link from "next/link";
import { LEGAL_TEXT_VERSION } from "../_lib/legal-version";
import { Wordmark } from "./Wordmark";

/** Marcador destacado para o que depende da Camila ou do advogado. Nunca preencher com dado inventado. */
export function Pendente({ children }: { children: ReactNode }) {
  return <mark className="lg-pendente">[PENDENTE: {children}]</mark>;
}

interface LegalPageProps {
  titulo: string;
  children: ReactNode;
}

export function LegalPage({ titulo, children }: LegalPageProps) {
  return (
    <div className="lg-body">
      <div className="lg-draft" role="note">
        <p>RASCUNHO, sem revisão jurídica. Versão <span className="lg-nowrap">{LEGAL_TEXT_VERSION}</span>.</p>
        <p>Versão de demonstração: o formulário grava os dados enviados. Use apenas dados fictícios.</p>
      </div>
      <header className="lg-header">
        <Link href="/" aria-label="Master Pet na Prática — início"><Wordmark /></Link>
      </header>
      <main className="lg-main">
        <h1>{titulo}</h1>
        <p className="lg-meta">Rascunho — versão {LEGAL_TEXT_VERSION}</p>
        {children}
      </main>
      <footer className="lg-footer">
        <Link href="/#conversar">Voltar ao formulário</Link>
      </footer>
    </div>
  );
}
