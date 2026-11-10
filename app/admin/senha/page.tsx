import Link from "next/link";
import { requireSession } from "../../_lib/session";
import { FOCO } from "../ui";
import { SenhaForm } from "./SenhaForm";

export default async function SenhaPage() {
  await requireSession();
  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="!m-0 !mb-1 font-[family-name:var(--font-display)] text-2xl font-semibold">Alterar senha</h1>
      <p className="!m-0 !mb-6 text-sm text-(--mp-ink-muted)">Ao salvar, os outros aparelhos conectados saem do painel. Este continua.</p>
      <SenhaForm />
      <Link href="/admin" className={`mt-6 inline-flex min-h-11 items-center text-sm underline text-blue-700 ${FOCO}`}>Voltar ao painel</Link>
    </main>
  );
}
