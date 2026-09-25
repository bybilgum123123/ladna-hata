'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { useLocale } from './locale';

function trackLight(event) {
  if (event.pointerType !== 'mouse') return;
  const bounds = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--cursor-x', `${event.clientX - bounds.left}px`);
  event.currentTarget.style.setProperty('--cursor-y', `${event.clientY - bounds.top}px`);
}

function PriceText({ price }) {
  const parts = /^(від|от) ([\d ]+) (\$|грн)(\/м²)?(.*)$/.exec(price);
  if (!parts) return price;
  return <>{parts[1]} <span className="service-bento__price-number">{parts[2]}</span> {parts[3]}{parts[4]}{parts[5]}</>;
}

export default function ServiceBento() {
  const { t } = useLocale();
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const numbers = [...document.querySelectorAll('.service-bento__price-number')];
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.removeAttribute('data-price-pending');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.35 });

    for (const number of numbers) {
      if (number.getBoundingClientRect().top < window.innerHeight) continue;
      number.setAttribute('data-price-pending', '');
      observer.observe(number);
    }

    return () => {
      observer.disconnect();
      numbers.forEach((number) => number.removeAttribute('data-price-pending'));
    };
  }, []);
  return (
    <div className="service-bento page-width" id="prices" aria-label={t.services.aria}>
      {t.services.cards.map(([title, detail, price], index) => (
        <div
          className={`service-bento__slot${index === 0 ? ' service-bento__slot--featured' : index === 5 ? ' service-bento__slot--materials' : index === 6 ? ' service-bento__slot--designer' : ''}`}
          data-reveal
          key={index}
          style={{ '--reveal-delay': `${index * 65}ms` }}
        >
          <a className="service-bento__card" href="#contact" onPointerEnter={trackLight} onPointerMove={trackLight}>
            {index === 0 && <Image className="service-bento__image" src="/images/portfolio/5307670930739895148_121.png" alt={t.process.photoAlt} fill sizes="(max-width: 760px) 100vw, 92vw" />}
            <span className="service-bento__marker" aria-hidden="true" />
            <span className="service-bento__content">
              <span className="service-bento__title">{title}</span>
              <span className="service-bento__detail">{detail}</span>
            </span>
            <span className="service-bento__price">
              <span>{t.services.priceLabel}</span>
              <strong><PriceText price={price} /></strong>
            </span>
          </a>
        </div>
      ))}
    </div>
  );
}
