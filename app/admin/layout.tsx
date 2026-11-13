import type { Metadata } from "next";
import "./admin.css";
import "./admin-overrides.css";

export const metadata: Metadata = { title: "Painel · Master Pet na Prática", robots: { index: false, follow: false } };

// .ad = escopo do CSS do painel; .ad-c = container das queries de largura (900/1000 px). O modal fica fora do .ad-c (tem o seu próprio container).
export default function AdminLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return (
    <div className="ad" id="ad">
      <div className="ad-c">{children}</div>
      {modal}
    </div>
  );
}
