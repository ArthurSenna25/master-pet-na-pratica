"use client";
import { useState } from "react";
import { OBSERVACAO_MAX } from "../../../_lib/admin/lead-edit";

/** Observação com contador "N / 2000" (só melhoria: sem JS o maxlength nativo e a validação do servidor valem). */
export function CampoObservacao({ inicial }: { inicial: string }) {
  const [n, setN] = useState(inicial.length);
  return (
    <div className="ad-fld">
      <label htmlFor="obs">Observação</label>
      <textarea id="obs" name="observacao" rows={5} maxLength={OBSERVACAO_MAX} defaultValue={inicial} aria-describedby="obs-cnt" onChange={(e) => setN(e.target.value.length)} />
      <p id="obs-cnt" className="ad-cnt">{n} / {OBSERVACAO_MAX}</p>
    </div>
  );
}
