import React, { useState } from 'react';

export function CamilaFrame({ src, alt = '', eyebrow = 'Atendimento', title = 'Camila em ação', noteTitle, note, example = true, pin = { x: '58%', y: '42%' }, defaultOpen = false, sealSrc = '../../assets/pingente-master-pet-400.webp', position = 'center top', className = '' }) {
  const [open, setOpen] = useState(defaultOpen);
  const hasNote = Boolean(note || noteTitle);
  return (
    <figure className={['mp-cf', className].filter(Boolean).join(' ')}>
      <div className="mp-cf__photo">
        <img src={src} alt={alt} style={{ objectPosition: position }} />
        {hasNote && <button type="button" className="mp-cf__pin" style={{ left: pin.x, top: pin.y }} aria-expanded={open} aria-label={'Ver observação: ' + (noteTitle || 'da Camila')} onClick={() => setOpen(!open)} />}
      </div>
      <figcaption className="mp-cf__ficha">
        <img className="mp-seal" src={sealSrc} alt="" width="44" height="30" style={{ width: 44, height: 'auto' }} />
        <div>
          <div className="mp-cf__ficha-eyebrow">{eyebrow}</div>
          <div className="mp-cf__ficha-title">{title}</div>
        </div>
        {hasNote && open && (
          <div className="mp-cf__ficha-note">
            {noteTitle && <strong className="mp-cf__note-title">{noteTitle}</strong>}
            {note && <p style={{ margin: 0 }}>{note}</p>}
            {example && <span className="mp-cf__todo">[exemplo — substituir pelo conteúdo real da Camila]</span>}
          </div>
        )}
      </figcaption>
    </figure>
  );
}
