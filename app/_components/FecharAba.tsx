"use client";
import { useState } from "react";

/** Páginas legais abrem em nova aba a partir do formulário. Tenta fechar a aba; se o navegador não deixar, orienta. Nunca navega para "/". */
export function FecharAba() {
  const [naoFechou, setNaoFechou] = useState(false);

  function fechar() {
    window.close();
    // Se a aba fechou, este código nem chega a mostrar nada; se continuar aberta, avisa.
    setTimeout(() => { if (!window.closed) setNaoFechou(true); }, 200);
  }

  return (
    <>
      <button type="button" className="lg-fechar" onClick={fechar}>Fechar e voltar ao formulário</button>
      {naoFechou && <p role="status" className="lg-fechar-msg">Pode fechar esta aba e voltar ao formulário.</p>}
    </>
  );
}
