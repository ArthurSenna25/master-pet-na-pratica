import { requireSession } from "../../../_lib/session";
import { LeadDetalhe } from "./LeadDetalhe";

type Busca = Record<string, string | string[] | undefined>;

// Abertura direta (URL, F5, sem JS). Na navegação a partir da lista, o slot @modal intercepta e usa o mesmo LeadDetalhe.
export default async function LeadPage(props: { params: Promise<{ id: string }>; searchParams: Promise<Busca> }) {
  const session = await requireSession();
  return <LeadDetalhe params={props.params} searchParams={props.searchParams} email={session.user.email} />;
}
