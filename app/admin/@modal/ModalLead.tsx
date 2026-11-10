"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

// <dialog> nativo + showModal(): foco preso, Esc e role=dialog vêm do navegador. O resto é só o que ele não faz:
// devolver o foco a quem abriu, fechar no clique fora e manter a URL coerente (fechar = voltar).
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
    const alvos = [...ref.current.querySelectorAll<HTMLElement>("a[href],button:not([disabled]),input:not([type=hidden]):not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex=\"-1\"])")];
    const primeiro = alvos[0], ultimo = alvos[alvos.length - 1];
    if (!primeiro || !ultimo) return;
    if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="lead-titulo"
      onKeyDown={prender}
      onCancel={(e) => { e.preventDefault(); fechar(); }}
      onClick={(e) => { if (e.target === ref.current) fechar(); }}
      className="m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto border-0 bg-slate-50 p-0 text-slate-900 backdrop:bg-slate-900/60 md:m-auto md:h-auto md:max-h-[90dvh] md:w-full md:max-w-2xl md:rounded-xl"
    >
      <div className="px-4 pb-8 pt-3">
        <div className="mb-2 flex justify-end">
          <button type="button" onClick={fechar} className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-400 bg-white px-4 font-[inherit] text-sm font-medium text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Fechar</button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
