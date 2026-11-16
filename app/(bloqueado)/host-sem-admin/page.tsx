import { notFound } from "next/navigation";

// Destino da reescrita de /admin/** no host da campanha mentoria (next.config.ts): o painel só existe no domínio principal.
export default function Page(): never {
  notFound();
}
