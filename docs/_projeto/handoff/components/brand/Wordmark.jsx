import React from 'react';

export function Wordmark({ tone = 'navy', size = 32, tagline = false, className = '' }) {
  return (
    <span className={['mp-wordmark', tone !== 'navy' && 'mp-wordmark--' + tone, className].filter(Boolean).join(' ')} style={{ fontSize: size }} role="img" aria-label="Master Pet">
      {tagline && <span className="mp-wordmark__tag">NA PRÁTICA</span>}
      <span className="mp-wordmark__master">MASTER</span>
      <span className="mp-wordmark__pet">PET</span>
    </span>
  );
}
