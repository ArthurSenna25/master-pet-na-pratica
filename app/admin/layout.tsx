import type { Metadata } from "next";
import { body, display } from "../_fonts";
import "../globals.css";
import "./admin.css";
import "./admin-overrides.css";

export const metadata: Metadata = { title: "Painel · Master Pet na Prática", robots: { index: false, follow: false } };

// ROOT LAYOUT PRÓPRIO do painel (F10 c3): não carrega o CSS da landing nem do `nm-*` (isolamento; antes o CSS da LP vazava aqui).
// .ad = escopo do CSS do painel; .ad-c = container das queries de largura (900/1000 px). O modal fica fora do .ad-c (tem o seu próprio container).
export default function AdminLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body>
        <div className="ad" id="ad">
          <div className="ad-c">{children}</div>
          {modal}
        </div>
      </body>
    </html>
  );
}
