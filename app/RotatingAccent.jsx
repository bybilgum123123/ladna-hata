'use client';

import { useEffect, useState } from 'react';
import { useLocale } from './locale';

export default function RotatingAccent() {
  const { locale, t } = useLocale();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer;
    const update = () => {
      clearInterval(timer);
      if (media.matches) { setIndex(0); return; }
      timer = setInterval(() => setIndex((current) => (current + 1) % 3), 3200);
    };
    update();
    media.addEventListener('change', update);
    return () => { clearInterval(timer); media.removeEventListener('change', update); };
  }, []);

  return (
    <p className="rotating-accent" aria-label={`${t.hero.rotatingLabel} ${t.hero.rotating[0]}`}>
      <span>{t.hero.rotatingLabel}</span>
      <span className="rotating-accent__frame" aria-hidden="true"><span key={`${locale}-${index}`}>{t.hero.rotating[index]}</span></span>
    </p>
  );
}
