"use client";

import { useState } from "react";

// "Onde o seu dia trava?" (handoff v4). A escolha é local: pré-seleciona o "maior desafio" do formulário (evento "nm:desafio") e acende a estação
// da trilha. NADA é enviado nem guardado. Sem JS os itens são links para o formulário (#lista). Sem movimento (só estado, CSS do handoff).
export const EVENTO_DESAFIO = "nm:desafio";

interface Opcao { letra: string; texto: string; estacao: number; desafio: string }
const OPCOES: Opcao[] = [
  { letra: "A", texto: "O dia vira correria e eu apago incêndio", estacao: 2, desafio: "processos" },
  { letra: "B", texto: "Cada pessoa da equipe faz de um jeito", estacao: 3, desafio: "equipe" },
  { letra: "C", texto: "Não sei se o meu preço está certo", estacao: 4, desafio: "preco" },
  { letra: "D", texto: "O atendimento muda conforme quem atende", estacao: 5, desafio: "atendimento" },
  { letra: "E", texto: "Não sei por onde começar", estacao: 1, desafio: "tudo" },
];

// Mesmas etapas e textos da trilha (CONTEUDO.md).
const ESTACAO: Record<number, { nome: string; frase: string }> = {
  1: { nome: "Raio-X do negócio", frase: "Olhamos o seu negócio como ele é: pessoas, fluxo e números. Você sai com um mapa claro de onde o dia trava." },
  2: { nome: "Gargalos", frase: "O que mais pesa vira prioridade, na ordem certa. Menos incêndio, mais direção." },
  3: { nome: "Equipe", frase: "Treinamento para que todos atendam com o mesmo cuidado, mesmo sem você por perto." },
  4: { nome: "Precificação, combos e planos", frase: "Preço com conta e critério. Combos e planos que fazem sentido para o seu negócio." },
  5: { nome: "Padrões", frase: "O jeito de fazer, escrito e combinado. Para não depender de memória, nem de você." },
};
const TRILHA = ["Raio-X", "Gargalos", "Equipe", "Preço", "Padrões", "Rotina"];

export function Diagnostico({ cta }: { cta: string }) {
  const [sel, setSel] = useState<Opcao | null>(null);

  const escolher = (o: Opcao) => {
    setSel(o);
    window.dispatchEvent(new CustomEvent(EVENTO_DESAFIO, { detail: { desafio: o.desafio } }));
  };

  const est = sel ? ESTACAO[sel.estacao] : null;
  return (
    <div className="nm-diag" id="diag">
      <div className="nm-diag__q">
        <span className="nm-eyebrow">18:00 · Diagnóstico</span>
        <h3 className="nm-h3">Onde o seu dia trava?</h3>
        <p className="nm-muted">
          Escolha o que mais pesa hoje. Nada é enviado: a escolha só pré-seleciona o seu maior desafio no formulário e acende a estação da trilha.
        </p>
        <ul className="nm-picks">
          {OPCOES.map((o) => (
            <li key={o.letra}>
              <a
                className={sel?.letra === o.letra ? "nm-pick is-on" : "nm-pick"}
                href="#lista"
                data-desafio={o.desafio}
                aria-current={sel?.letra === o.letra ? "true" : undefined}
                onClick={(e) => { e.preventDefault(); escolher(o); }}
              >
                <span aria-hidden="true">{o.letra}</span>
                {o.texto}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="nm-diag__r">
        <div className="nm-out" aria-live="polite">
          <span className="nm-out__k">A sua trilha</span>
          <p className="nm-out__t">{est ? `A trilha começaria por: ${est.nome}` : "Escolha uma opção ao lado."}</p>
          <p className="nm-out__d">{est ? est.frase : "Cada resposta acende uma estação da trilha."}</p>
        </div>
        <ol className="nm-rail" aria-hidden="true">
          {TRILHA.map((nome, i) => (
            <li key={nome} data-s={i + 1} className={sel?.estacao === i + 1 ? "is-on" : undefined}>
              <i></i>
              <span>{nome}</span>
            </li>
          ))}
        </ol>
        <a className="nm-btn" href="#lista">
          {cta}{" "}
          <svg className="nm-ico" aria-hidden="true" focusable="false"><use href="#nm-arrow" /></svg>
        </a>
      </div>
    </div>
  );
}
