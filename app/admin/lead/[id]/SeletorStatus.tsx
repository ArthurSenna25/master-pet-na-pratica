import { STATUS, STATUS_ROTULO, type Status } from "../../../_lib/admin/status";
import { Icone } from "../../Icone";

const ICONE: Record<Status, string> = { novo: "dot", em_contato: "phone", convertido: "check", nao_convertido: "x" };
const CLASSE: Record<Status, string> = { novo: "ad-rd--novo", em_contato: "ad-rd--contato", convertido: "ad-rd--conv", nao_convertido: "ad-rd--nao" };

/** 4 radios em grade 2×2 (setas navegam). Marcado = cor + ícone + texto + ✓ (nunca só cor). O campo se chama `status`, como a action espera. */
export function SeletorStatus({ atual }: { atual: string }) {
  return (
    <fieldset className="ad-stsel">
      <legend>Status</legend>
      {STATUS.map((s) => (
        <label key={s} className={`ad-rd ${CLASSE[s]}`}>
          <input type="radio" name="status" value={s} defaultChecked={s === atual} />
          <span><Icone nome={ICONE[s]} />{STATUS_ROTULO[s]}</span>
        </label>
      ))}
    </fieldset>
  );
}
