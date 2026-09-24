'use client';

import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 760px)');
    const targets = [...document.querySelectorAll('[data-reveal]')];

    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.removeAttribute('data-reveal-ready');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12 });

    for (const target of targets) {
      if (target.getBoundingClientRect().top <= window.innerHeight) continue;
      target.setAttribute('data-reveal-ready', '');
      observer.observe(target);
    }

    const revealAll = () => {
      if (!reducedMotion.matches) return;
      for (const target of targets) target.removeAttribute('data-reveal-ready');
      observer.disconnect();
    };

    reducedMotion.addEventListener('change', revealAll);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener('change', revealAll);
      for (const target of targets) target.removeAttribute('data-reveal-ready');
    };
  }, []);

  return null;
}
