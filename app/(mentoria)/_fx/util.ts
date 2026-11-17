/** Utilidades das cenas GSAP da mentoria. Módulo próprio: NÃO importa nada de app/_fx (landing); ver app/isolamento.test.ts. */
export type Cleanup = () => void;

/** Pin só em tela grande E alta (handoff: (min-width:900px) and (min-height:720px)); abaixo disso, versão sem pin. */
export const PIN = "(min-width:900px) and (min-height:720px)";
export const NOPIN = "(max-width:899px), (min-width:900px) and (max-height:719px)";

export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
