import React from 'react';
import { Icon } from '../icons/Icon.jsx';

export function Input({ label, hint, error, success, optional = false, multiline = false, prefix, suffix, disabled = false, readOnly = false, state, id, className = '', ...rest }) {
  const uid = id || 'mp-' + String(label || 'campo').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const tone = error ? 'error' : success ? 'success' : disabled ? 'disabled' : readOnly ? 'readonly' : '';
  const msg = error || success || hint;
  const glyph = error ? 'circle-alert' : success ? 'check' : null;
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <div className={['mp-field', tone && 'mp-field--' + tone, className].filter(Boolean).join(' ')}>
      {label && <label className="mp-field__label" htmlFor={uid}>{label}{optional && <span className="mp-field__opt">(opcional)</span>}</label>}
      <div className={['mp-field__control', multiline && 'mp-field__control--multi', state && 'is-' + state].filter(Boolean).join(' ')}>
        {prefix && <span className="mp-field__affix">{prefix}</span>}
        <Tag id={uid} className="mp-field__input" disabled={disabled} readOnly={readOnly} aria-invalid={error ? true : undefined} aria-describedby={msg ? uid + '-msg' : undefined} rows={multiline ? 4 : undefined} {...rest} />
        {suffix && <span className="mp-field__affix">{suffix}</span>}
      </div>
      {msg && <div id={uid + '-msg'} className="mp-field__hint" role={error ? 'alert' : undefined}>{glyph && <Icon name={glyph} />}<span>{msg}</span></div>}
    </div>
  );
}
