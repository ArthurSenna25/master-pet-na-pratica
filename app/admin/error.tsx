"use client";

import { Icone } from "./Icone";

// Texto fixo: nunca mostra error.message nem digest (podem conter dado pessoal ou detalhe técnico).
export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="ad-main ad-main--narrow">
      <div className="ad-err" role="alert">
        <Icone nome="alert" className="ad-empty__i" />
        <h2>Algo deu errado. Tente novamente.</h2>
        <button type="button" className="ad-btn ad-btn--navy" onClick={reset}>Tentar de novo</button>
      </div>
    </main>
  );
}
