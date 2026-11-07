import * as React from 'react';

/**
 * Cabeçalho navy com wordmark dourado à esquerda, navegação e UM botão primário.
 * @startingPoint section="Marca" subtitle="Header: wordmark + navegação + CTA" viewport="1100x120"
 */
export interface SiteHeaderProps {
  links?: { label: string; href?: string; current?: boolean }[];
  cta?: { label: string; href?: string };
  className?: string;
}
export declare function SiteHeader(props: SiteHeaderProps): JSX.Element;
