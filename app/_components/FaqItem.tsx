// F2: <details> nativo, sem JS. Na F3-motion, trocar por botão com aria-expanded se quiser a animação 8c.
import type { ReactNode } from "react";
import { vars } from "./vars";

interface FaqItemProps {
  pergunta: string;
  delay: number;
  children: ReactNode;
}

export function FaqItem({ pergunta, delay, children }: FaqItemProps) {
  return (
    <details className="lp-q mp-reveal" style={vars({ "--i": delay })}>
      <summary><span>{pergunta}</span><span className="lp-plus" aria-hidden="true" /></summary>
      <div className="lp-a"><div><p>{children}</p></div></div>
    </details>
  );
}
