import { requireSession } from "../_lib/session";
import { Cabecalho } from "./Cabecalho";

export default async function VisaoGeralPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireSession();
  const { ok } = await searchParams;
  return (
    <>
      <Cabecalho email={session.user.email} ativa="visao" />
      <main className="mx-auto max-w-6xl px-4 py-6">
        {ok === "senha" && <p role="status" className="mb-3 rounded-md bg-green-100 p-3">Senha alterada. Os outros aparelhos foram desconectados.</p>}
        <h2 className="m-0 mb-4 font-[family-name:var(--font-display)] text-xl font-semibold">Visão geral</h2>
      </main>
    </>
  );
}
