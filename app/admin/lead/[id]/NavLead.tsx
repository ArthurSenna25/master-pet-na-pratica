import Link from "next/link";

/** No modal: Link (soft nav, intercepta, replace). Na página direta: <a>, senão a navegação suave abriria o modal por cima da página. */
export function NavLead({ modal, href, className, children }: { modal: boolean; href: string; className: string; children: React.ReactNode }) {
  return modal
    ? <Link replace prefetch={false} href={href} className={className}>{children}</Link>
    : <a href={href} className={className}>{children}</a>;
}
