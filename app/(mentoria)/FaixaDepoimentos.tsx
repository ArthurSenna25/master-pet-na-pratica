"use client";

import { useSyncExternalStore, type ReactNode } from "react";

// A faixa de depoimentos só vira "região rolável focável" (tabindex=0) abaixo de 900 px, onde ela rola na horizontal; acima disso é grade e
// não deve ser parada de Tab. Reage à mudança de largura (matchMedia "change", com cleanup). Sem JS / SSR: sem tabindex.
const ESTREITA = "(max-width: 899px)";
const assinar = (aviso: () => void) => {
  const m = window.matchMedia(ESTREITA);
  m.addEventListener("change", aviso);
  return () => m.removeEventListener("change", aviso);
};
const agora = () => window.matchMedia(ESTREITA).matches;
const noServidor = () => false;

export function FaixaDepoimentos({ children }: { children: ReactNode }) {
  const estreita = useSyncExternalStore(assinar, agora, noServidor);
  return (
    <ul className="nm-dep__track" tabIndex={estreita ? 0 : undefined} aria-label="Depoimentos em faixa rolável. Use as setas do teclado para navegar.">
      {children}
    </ul>
  );
}
