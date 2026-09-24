'use client';

import { useEffect, useRef, useState } from 'react';

export default function CountPrice({ value }) {
  const ref = useRef(null);
  const played = useRef(false);
  const [shown, setShown] = useState(value);
  const formatted = (number) => number.toLocaleString('en-US').replaceAll(',', ' ');

  useEffect(() => {
    if (played.current || !ref.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    setShown(0);
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || played.current) return;
      played.current = true;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / 1000, 1);
        setShown(Math.round(value * (1 - (1 - progress) ** 3)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      observer.disconnect();
    }, { threshold: 0, rootMargin: '0px 0px -15% 0px' });
    observer.observe(ref.current.closest('.price-section') || ref.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [value]);

  return <span className="price-amount__number" style={{ '--number-chars': formatted(value).length }} ref={ref} aria-hidden="true">{formatted(shown)}</span>;
}
