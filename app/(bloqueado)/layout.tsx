import type { Metadata } from "next";

// Grupo mínimo para respostas 404 explícitas (ex.: /admin no host da campanha mentoria). Sem CSS, sem fontes, sem script próprio.
export const metadata: Metadata = { title: "Página não encontrada", robots: { index: false, follow: false } };

export default function BloqueadoLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
