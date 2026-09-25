'use client';

import BrandMark from './BrandMark';
import { useLocale } from './locale';

export default function NotFound() {
  const { t } = useLocale();
  return (
    <main className="not-found page-width">
      <BrandMark href="/" />
      <div className="not-found__content">
        <p className="eyebrow"><span aria-hidden="true" />404</p>
        <h1>{t.notFound.title}</h1>
        <p>{t.notFound.description}</p>
        <div className="not-found__actions">
          <a className="button button--primary" href="/">{t.notFound.home}</a>
          <a className="button button--quiet" href="/#works">{t.notFound.works}</a>
        </div>
      </div>
    </main>
  );
}
