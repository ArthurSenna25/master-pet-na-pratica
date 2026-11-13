import Link from "next/link";
import { requireSession } from "../../_lib/session";
import { SenhaForm } from "./SenhaForm";

export default async function SenhaPage() {
  await requireSession();
  return (
    <main className="ad-main ad-main--narrow">
      <p className="ad-crumb"><Link href="/admin" prefetch={false}>← Voltar ao painel</Link></p>
      <section className="ad-card ad-conf" aria-labelledby="senha-h">
        <div className="ad-pg-hd"><h1 id="senha-h">Alterar senha</h1></div>
        <p className="ad-hint">Ao salvar, os outros aparelhos conectados saem do painel. Se este também sair, entre de novo com a nova senha.</p>
        <SenhaForm />
      </section>
    </main>
  );
}
