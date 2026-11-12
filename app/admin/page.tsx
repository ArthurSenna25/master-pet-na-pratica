import { requireSession } from "../_lib/session";
import { carregarVisaoGeral } from "../_lib/admin/visao-geral-query";
import { Cabecalho } from "./Cabecalho";
import { VisaoGeralView } from "./visao/VisaoGeralView";

export default async function VisaoGeralPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireSession();
  const { ok } = await searchParams;
  const agora = new Date();
  const dados = await carregarVisaoGeral(agora);
  return (
    <>
      <Cabecalho email={session.user.email} ativa="visao" />
      <VisaoGeralView dados={dados} agora={agora} ok={typeof ok === "string" ? ok : undefined} />
    </>
  );
}
