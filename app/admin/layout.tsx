import type { Metadata } from "next";

export const metadata: Metadata = { title: "Painel · Master Pet na Prática", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <main style={{ maxWidth: 420, margin: "10vh auto", padding: "0 24px", fontFamily: "var(--font-body, system-ui)" }}>{children}</main>;
}
