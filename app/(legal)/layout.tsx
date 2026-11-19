import type { Metadata } from "next";
import { body, display } from "../_fonts";
import "../globals.css";
import "../landing/styles.css";
import "../landing/landing-v6.css";
import "../landing/depoimentos.css";
import "../landing/static-overrides.css";
import "../landing/legal.css";

// Política e termos: compartilhados pelas duas campanhas, com a casca visual da marca (mesmo CSS de antes da F10; só mudou o root layout).
export const metadata: Metadata = { title: "Master Pet na Prática" };

export default function LegalRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
