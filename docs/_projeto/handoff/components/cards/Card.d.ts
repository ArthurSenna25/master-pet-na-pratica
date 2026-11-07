import * as React from 'react';

/**
 * Card editorial: serifa no título, sombra navy, borda hairline bege.
 * @startingPoint section="Componentes" subtitle="Card: padrão, navy, apoio, contorno" viewport="700x520"
 */
export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  variant?: 'default' | 'navy' | 'support' | 'outline';
  eyebrow?: string;
  title?: React.ReactNode;
  media?: { src: string; alt?: string; position?: string };
  footer?: React.ReactNode;
  /** Hover eleva e revela filete de ação (ouro) */
  interactive?: boolean;
  href?: string;
  state?: 'hover';
  children?: React.ReactNode;
}
export declare function Card(props: CardProps): JSX.Element;
