'use client';

import { useLocale } from './locale';

function moveSpotlight(event) {
  if (event.pointerType === 'touch') return;
  const bounds = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
  event.currentTarget.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
}

export default function ServiceBento() {
  const { t } = useLocale();
  return (
    <div className="service-bento page-width" aria-label={t.services.aria}>
      {t.services.cards.map(([title, detail, price], index) => (
        <div
          className={`service-bento__slot${index === 0 ? ' service-bento__slot--featured' : index === 5 ? ' service-bento__slot--materials' : ''}`}
          data-reveal
          key={index}
          style={{ '--reveal-delay': `${index * 65}ms` }}
        >
          <a className="service-bento__card" href="#contact" onPointerMove={moveSpotlight}>
            <span className="service-bento__top">
              <span className="service-bento__index">{String(index + 1).padStart(2, '0')} / 06</span>
              <span className="service-bento__arrow" aria-hidden="true">↗</span>
            </span>
            <span className="service-bento__content">
              <span className="service-bento__title">{title}</span>
              <span className="service-bento__detail">{detail}</span>
            </span>
            <span className="service-bento__price">
              <span>{t.services.priceLabel}</span>
              <strong>{price}</strong>
            </span>
          </a>
        </div>
      ))}
    </div>
  );
}
