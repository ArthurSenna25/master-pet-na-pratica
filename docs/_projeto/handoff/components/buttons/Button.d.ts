import * as React from 'react';

/**
 * Botão de ação. Dourado (primary) = a única ação principal da tela.
 * @startingPoint section="Componentes" subtitle="Botão: 5 variantes, 3 tamanhos, todos os estados" viewport="700x420"
 */
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** primary = ouro (ação) · secondary = navy · outline · ghost · inverse = sobre navy */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'inverse';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** Seta (Lucide) à direita */
  arrow?: boolean;
  /** Nome de ícone Lucide à esquerda */
  icon?: string;
  /** Brilho do CTA — o ÚNICO loop da seção; só opacity; estático com reduced-motion */
  glow?: boolean;
  /** Renderiza <a> */
  href?: string;
  /** Força estado visual (docs): hover | active | focus */
  state?: 'hover' | 'active' | 'focus';
  children?: React.ReactNode;
}
export declare function Button(props: ButtonProps): JSX.Element;
