import * as React from 'react';

/**
 * Ícone funcional (Lucide, ISC) — traço 1.5, 20–24px, sempre acompanhado de texto. Sem emoji.
 */
export interface IconProps {
  name: 'arrow-right' | 'check' | 'circle-alert' | 'calendar-check' | 'message-circle' | 'info' | 'chevron-right' | 'x' | 'list-checks' | 'users' | 'tag' | 'wallet' | 'compass' | 'chevron-down';
  /** 20 (padrão) ou 24 */
  size?: 20 | 24;
  stroke?: number;
  /** Só use title quando o ícone estiver sozinho; com texto ao lado, deixe vazio (aria-hidden) */
  title?: string;
  className?: string;
}
export declare function Icon(props: IconProps): JSX.Element;
