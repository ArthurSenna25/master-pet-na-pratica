import React from 'react';

export function Card({ variant = 'default', eyebrow, title, media, footer, interactive = false, href, state, className = '', children, ...rest }) {
  const cls = ['mp-card', variant !== 'default' && 'mp-card--' + variant, interactive && 'mp-card--interactive', state && 'is-' + state, className].filter(Boolean).join(' ');
  const Tag = href ? 'a' : 'div';
  return (
    <Tag className={cls} href={href} {...rest}>
      {media && <div className="mp-card__media"><img src={media.src} alt={media.alt || ''} style={media.position ? { objectPosition: media.position } : undefined} /></div>}
      <div className="mp-card__body">
        {eyebrow && <div className="mp-card__eyebrow">{eyebrow}</div>}
        {title && <h3 className="mp-card__title">{title}</h3>}
        {children && <div className="mp-card__text">{children}</div>}
      </div>
      {footer && <div className="mp-card__footer">{footer}</div>}
    </Tag>
  );
}
