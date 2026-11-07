import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import "./landing/styles.css";
import "./landing/landing-v6.css";
import "./landing/static-overrides.css";
import "./landing/legal.css";

const display = Playfair_Display({
  subsets: ["latin"],
  weight: "600",
  display: "swap",
  variable: "--font-display",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Master Pet na Prática",
  description:
    "Mentoria presencial e individual para donos de banho e tosa, com a Camila Becari.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body>
        {/* Sem JS o FAQ não abre: mostra as respostas (CSS puro, sem script). */}
        <noscript><style>{".lp-a{grid-template-rows:1fr}.lp-a>div{visibility:visible}"}</style></noscript>
        {children}
      </body>
    </html>
  );
}
