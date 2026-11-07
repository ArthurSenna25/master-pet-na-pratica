import * as React from 'react';

/**
 * Elemento-assinatura "Camila em ação": foto real da Camila em atendimento/treinamento, moldura navy deslocada,
 * ficha com selo e um ÚNICO pin dourado que abre uma observação (título + texto). Não afirmar que é "no negócio de um cliente".
 * @startingPoint section="Assinatura" subtitle="Camila em ação — foto + ficha + pin" viewport="700x640"
 */
export interface CamilaFrameProps {
  src: string;
  alt?: string;
  /** Linha pequena da ficha (ex.: "Atendimento", "Treinamento") */
  eyebrow?: string;
  title?: string;
  /** Título da observação do pin (ex.: "Fluxo de atendimento") */
  noteTitle?: string;
  /** Texto genérico. Sem pin se não houver noteTitle nem note. Sem números, nomes de clientes ou resultados. */
  note?: string;
  /** Mostra a marca "[exemplo — substituir pelo conteúdo real da Camila]" (padrão: true) */
  example?: boolean;
  pin?: { x: string; y: string };
  defaultOpen?: boolean;
  sealSrc?: string;
  position?: string;
  className?: string;
}
export declare function CamilaFrame(props: CamilaFrameProps): JSX.Element;
