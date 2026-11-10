import { requireSession } from "../../../../_lib/session";
import { LeadDetalhe } from "../../../lead/[id]/LeadDetalhe";
import { ModalLead } from "../../ModalLead";

// Mesma tela e mesmas actions da página direta; só muda o invólucro (<dialog>).
export default async function LeadModal(props: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireSession();
  return (
    <ModalLead>
      <LeadDetalhe params={props.params} searchParams={props.searchParams} modal />
    </ModalLead>
  );
}
