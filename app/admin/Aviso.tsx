import { Icone } from "./Icone";

/** Aviso do painel: erro (role=alert) ou sucesso (role=status). */
export function Aviso({ tipo, children, entrada = false }: { tipo: "erro" | "ok"; children: React.ReactNode; entrada?: boolean }) {
  if (tipo === "erro") return <p className="ad-alert" role="alert"><Icone nome="alert" />{children}</p>;
  return <p className={`ad-okbar${entrada ? " ad-okbar--in" : ""}`} role="status"><Icone nome="check" /><span>{children}</span></p>;
}
