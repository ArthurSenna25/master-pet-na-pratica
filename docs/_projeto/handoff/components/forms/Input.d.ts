import * as React from 'react';

/**
 * Campo de texto com rótulo sempre visível e estados: padrão, hover, foco, preenchido, erro, sucesso, desabilitado, somente leitura.
 * @startingPoint section="Componentes" subtitle="Campo com 8 estados" viewport="700x620"
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  hint?: string;
  /** Mensagem de erro (ícone + texto, nunca só cor) */
  error?: string;
  success?: string;
  optional?: boolean;
  multiline?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  readOnly?: boolean;
  /** Força estado visual (docs): hover | focus */
  state?: 'hover' | 'focus';
}
export declare function Input(props: InputProps): JSX.Element;
