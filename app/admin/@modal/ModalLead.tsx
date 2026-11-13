"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

// <dialog> nativo + showModal(): foco preso, Esc e role=dialog vêm do navegador. O resto é só o que ele não faz:
// devolver o foco a quem abriu, fechar no clique fora (no .ad-ov, que cobre a tela) e manter a URL coerente (fechar = voltar).
export function ModalLead({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const origem = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!d.open) d.showModal();
    return () => {
      document.body.style.overflow = overflow;
      if (origem?.isConnected) origem.focus();
    };
  }, []);

  const fechar = () => router.back();

  // O <dialog> já torna o resto da página inerte; isto só faz o Tab dar a volta (em vez de ir à interface do navegador).
  const prender = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== "Tab" || !ref.current) return;
    const alvos = [...ref.current.querySelectorAll<HTMLElement>("a[href],button:not([disabled]),input:not([type=hidden]):not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex=\"-1\"])")].filter((el) => el.offsetParent !== null);
    const primeiro = alvos[0], ultimo = alvos[alvos.length - 1];
    if (!primeiro || !ultimo) return;
    if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
  };

  return (
    <dialog ref={ref} className="ad-modal" aria-labelledby="lead-titulo" onKeyDown={prender} onCancel={(e) => { e.preventDefault(); fechar(); }}
      onClick={(e) => { if (e.target === ref.current) fechar(); }}>
      <div className="ad-ov is-live" onClick={(e) => { if (e.target === e.currentTarget) fechar(); }}>{children}</div>
    </dialog>
  );
}
