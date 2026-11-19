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

/**
 * Rede de segurança em tempo de execução: com o pin ligado (classe `.is-pinned` já posta), o conteúdo cabe na altura disponível?
 * Se não, o chamador desfaz o pin e cai para cards (NOPIN) em vez de cortar. `itens` (opcional) têm de caber na altura de `area`.
 */
export const cabe = (pin: HTMLElement, itens: HTMLElement[] = [], area: HTMLElement = pin): boolean =>
  pin.scrollHeight <= pin.clientHeight + 1 && itens.every((i) => i.offsetHeight <= area.clientHeight + 1);

/**
 * `cabe` para uma seção que pode estar com ou sem `.is-pinned`: posta a classe só durante a medição (síncrono, sem pintura) e restaura.
 * Usado pela reavaliação em resize/fontes (MentoriaFx) e igual ao critério da ativação.
 */
export const cabePin = (sec: HTMLElement, pinSel: string, itensSel?: string, areaSel?: string): boolean => {
  const tinha = sec.classList.contains("is-pinned");
  sec.classList.add("is-pinned");
  const pin = sec.querySelector<HTMLElement>(pinSel), area = areaSel ? sec.querySelector<HTMLElement>(areaSel) : pin;
  const ok = !!pin && !!area && cabe(pin, itensSel ? [...sec.querySelectorAll<HTMLElement>(itensSel)] : [], area);
  if (!tinha) sec.classList.remove("is-pinned");
  return ok;
};

/** Decisão ÚNICA de pin para Dia e Trilha: só ligam juntos (os dois cabem). Evita estado misto (um com pin, outro em cards) quando um deles estoura por poucos px. */
export const pinCabeNosDois = (): boolean => {
  const d = document.querySelector<HTMLElement>(".nm-dia"), t = document.querySelector<HTMLElement>(".nm-trilha");
  if (!d || !t) return false;
  const js = t.classList.contains("is-js"); // a navegação 1…6 (is-js) ocupa altura: mede sempre com ela, igual ao estado final, seja qual cena rode primeiro
  t.classList.add("is-js");
  const ok = cabePin(d, ".nm-dia__pin") && cabePin(t, ".nm-trilha__pin", ".nm-st", ".nm-deck");
  if (!js) t.classList.remove("is-js");
  return ok;
};

export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
