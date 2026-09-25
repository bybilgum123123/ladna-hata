"use client";

import { useLocale } from './locale';

export default function BrandMark({ href = '#top' }) {
  const { t } = useLocale();
  return (
    <a className="brand-mark" href={href} aria-label={`Ладна Хата — ${t.brand.tagline}`}>
      <span className="brand-mark__icon" aria-hidden="true">
        <svg viewBox="0 0 52 52" fill="none" focusable="false">
          <path d="M13 40V24C13 16.8 18.8 11 26 11s13 5.8 13 13v16H13Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M26 11v29M13 28h26" stroke="currentColor" strokeWidth="1.2" />
          <path d="M13 40h26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M26 28h13" stroke="#C8AC78" strokeWidth="1.4" />
        </svg>
      </span>
      <span className="brand-mark__copy">
        <span className="brand-mark__name">Ладна Хата</span>
        <span className="brand-mark__tagline">{t.brand.tagline}</span>
      </span>
    </a>
  );
}
