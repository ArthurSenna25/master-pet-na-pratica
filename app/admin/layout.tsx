import type { Metadata } from "next";

export const metadata: Metadata = { title: "Painel · Master Pet na Prática", robots: { index: false, follow: false } };

export default function AdminLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" style={{ fontFamily: "var(--font-body, system-ui)" }}>
      {children}
      {modal}
    </div>
  );
}
