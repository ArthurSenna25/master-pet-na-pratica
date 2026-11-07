import React from 'react';
import { Button } from '../buttons/Button.jsx';
import { Wordmark } from './Wordmark.jsx';

export function SiteHeader({ links = [], cta, className = '' }) {
  return (
    <header className={['mp-header', className].filter(Boolean).join(' ')}>
      <a href="#" style={{ textDecoration: 'none', display: 'inline-flex' }} aria-label="Master Pet na Prática — início"><Wordmark tone="gold" size={28} /></a>
      <nav className="mp-header__nav" aria-label="Principal">
        {links.map((l) => <a key={l.label} href={l.href || '#'} className="mp-header__link" aria-current={l.current ? 'page' : undefined}>{l.label}</a>)}
        {cta && <Button size="sm" href={cta.href || '#'}>{cta.label}</Button>}
      </nav>
    </header>
  );
}
