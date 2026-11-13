"use client";
import { useFormStatus } from "react-dom";

/** Barra fixa no rodapé do modal/página: confirmação visível à esquerda (role=status, vem do servidor) e Salvar à direita ("Salvando…" durante o envio). */
export function BarraSalvar({ confirmacao }: { confirmacao: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <div className="ad-savebar">
      <div className="ad-savebar__msg">{confirmacao}</div>
      <button type="submit" className="ad-btn ad-btn--primary" aria-disabled={pending || undefined} onClick={(e) => { if (pending) e.preventDefault(); }}>
        {pending ? "Salvando…" : "Salvar"}
      </button>
    </div>
  );
}
