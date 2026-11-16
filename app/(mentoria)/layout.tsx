import type { Metadata } from "next";
import "./nm.css";

// Root layout próprio da campanha mentoria: sem tokens, fontes, CSS nem GSAP da LP presencial (guardas em e2e/css-escopo.spec.ts e
// app/isolamento.test.ts). noindex até a publicação; canonical aponta para o domínio da campanha.
export const metadata: Metadata = {
  title: "Mentoria Master Pet",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://mentoria-master-pet.vercel.app/" },
};

export default function MentoriaRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
