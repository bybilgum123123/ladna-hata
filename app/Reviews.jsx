'use client';

import { useLocale } from './locale';

// TODO: Додати лише підтверджені відгуки з дозволом на публікацію.
// Поля: name, text, rating, date, source.
export const reviews = [];

export default function Reviews() {
  const { t } = useLocale();
  if (reviews.length === 0) return null;

  return (
    <section className="reviews-section page-width" aria-labelledby="reviews-title">
      <h2 id="reviews-title">{t.reviews}</h2>
      <div className="reviews-section__list">
        {reviews.map((review) => (
          <blockquote key={`${review.name}-${review.date}`}>
            <p>{review.text}</p>
            <footer>{review.name} · {review.date} · {review.source}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
