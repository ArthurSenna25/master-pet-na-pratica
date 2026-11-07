import * as React from 'react';

/**
 * Wordmark tipográfico MASTER / PET (stand-in em Playfair até existir o vetor oficial). Usar no header.
 */
export interface WordmarkProps {
  /** navy (sobre claro) · gold / beige (sobre navy) */
  tone?: 'navy' | 'gold' | 'beige';
  /** font-size base em px (altura de MASTER) */
  size?: number;
  /** Mostra "NA PRÁTICA" acima */
  tagline?: boolean;
  className?: string;
}
export declare function Wordmark(props: WordmarkProps): JSX.Element;
