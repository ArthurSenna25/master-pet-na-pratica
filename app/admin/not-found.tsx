import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Texto fixo: nada da URL nem de dado entra aqui.
export default function NotFound() {
  return (
    <main style={{ padding: "48px 24px" }}>
      <h1>Página não encontrada</h1>
      <p><Link href="/admin" prefetch={false}>Voltar ao painel</Link></p>
    </main>
  );
}
