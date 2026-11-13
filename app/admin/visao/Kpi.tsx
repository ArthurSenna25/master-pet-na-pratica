import Link from "next/link";
import { vars } from "../../_components/vars";
import { Icone } from "../Icone";

interface Props {
  rotulo: string;
  /** Número grande; `null` = sem dados suficientes (mostra `semDados`). */
  numero: number | string | null;
  semDados?: string;
  sub: React.ReactNode;
  i: number;
  /** Cartão-chave (navy, clicável): leva à lista. */
  href?: string;
}

/** Cartão de métrica da Visão geral. Com `href` vira o cartão-chave ("Aguardando contato"). */
export function Kpi({ rotulo, numero, semDados, sub, i, href }: Props) {
  const corpo = (
    <>
      <p className="ad-kpi__l">{rotulo}</p>
      <p className="ad-kpi__n">{numero === null ? <span className="ad-kpi__none">{semDados}</span> : numero}</p>
      <p className="ad-kpi__s">{sub}</p>
      {href && <span className="ad-kpi__go">Ver lista<Icone nome="arrow" /></span>}
    </>
  );
  if (href) return <Link className="ad-kpi ad-kpi--key ad-in" href={href} prefetch={false} style={vars({ "--i": i })}>{corpo}</Link>;
  return <div className="ad-kpi ad-in" style={vars({ "--i": i })}>{corpo}</div>;
}
