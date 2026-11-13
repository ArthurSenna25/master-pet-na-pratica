"use client";
import { useRouter } from "next/navigation";
import { Icone } from "../../Icone";

/** Fechar o modal = voltar (a URL volta à lista com os filtros). Primeiro foco do <dialog>. */
export function BotaoFechar() {
  const router = useRouter();
  return <button className="ad-x" type="button" aria-label="Fechar" onClick={() => router.back()}><Icone nome="x" /></button>;
}
