/** Utilidades das cenas GSAP da mentoria. Módulo próprio: NÃO importa nada de app/_fx (landing); ver app/isolamento.test.ts. */
export type Cleanup = () => void;

/**
 * Critério ÚNICO do pin (position: sticky + scrub) de Dia e Trilha. O CSS não repete o limite: ele só reage à classe `.is-pinned`, posta pelo JS ao casar PIN.
 * Dois degraus, medidos com qa/pin-matriz.mjs: em tela larga (>=1091; medido: 1090 estoura por uma quebra de linha, 1091 cabe) tudo cabe a partir de 590 px de altura; em janela estreita (900-1090) o Diagnóstico e a Trilha
 * quebram o texto em mais linhas e só cabem a partir de 640 px. Abaixo disso (celular, tablet em pé, janela baixa) vira cards (NOPIN).
 * NOPIN é o complemento exato de PIN (provado em util.test.ts). Mudar um número aqui muda o JS inteiro; rode a matriz de novo.
 */
export const PIN_MIN_W = 900, PIN_MIN_H = 640; // degrau geral
export const PIN_WIDE_W = 1091, PIN_WIDE_H = 590; // degrau tela larga (notebooks)
export const PIN = `(min-width:${PIN_MIN_W}px) and (min-height:${PIN_MIN_H}px), (min-width:${PIN_WIDE_W}px) and (min-height:${PIN_WIDE_H}px)`;
export const NOPIN = `(max-width:${PIN_MIN_W - 1}px), (max-height:${PIN_WIDE_H - 1}px), (max-width:${PIN_WIDE_W - 1}px) and (max-height:${PIN_MIN_H - 1}px)`;

export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
