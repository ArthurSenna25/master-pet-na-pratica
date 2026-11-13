"use client";
import { useEffect } from "react";

/** Menus <details> do cabeçalho: Esc fecha e devolve o foco ao botão; clique fora fecha. Sem JS os menus seguem abrindo/fechando pelo teclado nativo. */
export function FechaMenus() {
  useEffect(() => {
    const abertos = () => [...document.querySelectorAll<HTMLDetailsElement>("details.ad-dd[open]")];
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      for (const m of abertos()) {
        m.removeAttribute("open");
        m.querySelector<HTMLElement>("summary")?.focus();
      }
    };
    const aoClicar = (e: MouseEvent) => {
      for (const m of abertos()) if (!m.contains(e.target as Node)) m.removeAttribute("open");
    };
    document.addEventListener("keydown", aoTeclar);
    document.addEventListener("click", aoClicar);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.removeEventListener("click", aoClicar);
    };
  }, []);
  return null;
}
