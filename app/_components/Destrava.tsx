import type { ReactNode } from "react";
import { vars } from "./vars";

function Ico({ size, children }: { size: number; children: ReactNode }) {
  return (
    <span className="ico">
      <svg className="mp-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
    </span>
  );
}

export function Destrava() {
  return (
    <section className="lp-sec lp-sec--blue" id="destrava" data-screen-label="05 O que destrava">
      <div className="mp-fx mp-fx--grain" />
      <div className="lp-wrap">
        <span className="mp-eyebrow mp-reveal" style={vars({ "--i": 0 })}>O que destrava</span>
        <h2 className="lp-h2 mp-reveal" style={vars({ "--i": 1, marginTop: 16, maxWidth: 720 })}>O que muda na sua rotina.</h2>
        <div className="lp-bento">
          <div className="lp-b lp-b--big"><Ico size={32}><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /><path d="M13 6h8" /><path d="M13 12h8" /><path d="M13 18h8" /></Ico><span className="lp-b__t">Processos e padrão</span></div>
          <div className="lp-b"><Ico size={24}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Ico><span className="lp-b__t">Equipe treinada</span></div>
          <div className="lp-b"><Ico size={24}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" /></Ico><span className="lp-b__t">Precificação correta</span></div>
          <div className="lp-b"><Ico size={24}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></Ico><span className="lp-b__t">Financeiro organizado</span></div>
          <div className="lp-b"><Ico size={24}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></Ico><span className="lp-b__t">Atendimento</span></div>
          <div className="lp-b lp-b--wide"><Ico size={32}><circle cx="12" cy="12" r="10" /><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" /></Ico><span className="lp-b__t">Você liderando, não só operando</span></div>
        </div>
      </div>
    </section>
  );
}
