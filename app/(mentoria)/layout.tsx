import type { Metadata } from "next";
import { nmBody, nmDisplay } from "./_fonts";
import "./nm-tokens.css";
import "./mentoria.css";
import "./nm.css";

// Root layout próprio da campanha mentoria: sem tokens, fontes, CSS nem GSAP da LP presencial (guardas em e2e/css-escopo.spec.ts e
// app/isolamento.test.ts). noindex até a publicação; canonical aponta para o domínio da campanha.
export const metadata: Metadata = {
  title: "Mentoria Master Pet · Pré-inscrição",
  description: "Mentoria online e individual com a Camila Becari. Entre na lista da turma e receba o aviso em primeira mão.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://mentoria-master-pet.vercel.app/" },
};

export default function MentoriaRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${nmDisplay.variable} ${nmBody.variable}`}>
      <body className="nm-root">{children}</body>
    </html>
  );
}
