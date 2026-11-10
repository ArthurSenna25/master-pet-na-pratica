import Link from "next/link";
import { requireSession } from "../../../_lib/session";
import { LeadDetalhe } from "./LeadDetalhe";

type Busca = Record<string, string | string[] | undefined>;

// Abertura direta (URL, F5, sem JS). Na navegação a partir da lista, o slot @modal intercepta e usa o mesmo LeadDetalhe.
export default async function LeadPage(props: { params: Promise<{ id: string }>; searchParams: Promise<Busca> }) {
  await requireSession();
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <p className="m-0 mb-4 flex">
        <Link href="/admin" className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-400 bg-white px-4 text-sm font-medium font-[inherit] no-underline text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">← Voltar à lista</Link>
      </p>
      <LeadDetalhe params={props.params} searchParams={props.searchParams} />
    </main>
  );
}
