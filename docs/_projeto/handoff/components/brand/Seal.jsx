import React from 'react';

export function Seal({ size = 44, src = '../../assets/pingente-master-pet-400.webp', alt = 'Selo Master Pet na Prática', className = '' }) {
  return <img className={['mp-seal', className].filter(Boolean).join(' ')} src={src} alt={alt} style={{ width: size, height: 'auto' }} />;
}
