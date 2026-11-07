import React from 'react';
import { Icon } from '../icons/Icon.jsx';

export function Button({ variant = 'primary', size = 'md', block = false, loading = false, disabled = false, arrow = false, glow = false, icon, href, state, className = '', children, ...rest }) {
  const cls = ['mp-btn', 'mp-btn--' + variant, 'mp-btn--' + size, block && 'mp-btn--block', glow && 'mp-btn--glow', state && 'is-' + state, className].filter(Boolean).join(' ');
  const content = (
    <>
      {icon && <Icon name={icon} />}
      {children}
      {arrow && <span className="mp-btn__arrow"><Icon name="arrow-right" /></span>}
    </>
  );
  if (href && !disabled) return <a className={cls} href={href} {...rest}>{content}</a>;
  return <button type="button" className={cls} disabled={disabled} aria-busy={loading || undefined} {...rest}>{content}</button>;
}
