import * as React from 'react';

/**
 * Pingente "Na Prática" como SELO PEQUENO (24–64px): rodapé, ficha de visita, certificado. Nunca como logo do header.
 */
export interface SealProps {
  /** Largura em px (24–64 recomendado) */
  size?: number;
  src?: string;
  alt?: string;
  className?: string;
}
export declare function Seal(props: SealProps): JSX.Element;
