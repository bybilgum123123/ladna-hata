'use client';

import { useState } from 'react';
import SplitHeading from './SplitHeading';
import { useLocale } from './locale';

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);
  const { t } = useLocale();

  return (
    <section className="faq-section page-width" id="faq" aria-labelledby="faq-title">
      <div className="faq-section__heading">
        <SplitHeading id="faq-title" text={t.faq.title} />
        <p>{t.faq.intro}</p>
      </div>
      <div className="faq-list">
        {t.faq.items.map(([question, answer], index) => {
          const isOpen = openIndex === index;
          const panelId = `faq-panel-${index}`;
          return (
            <div className="faq-item" key={index}>
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                >
                  <span>{question}</span>
                  <span className="faq-item__icon" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>
              </h3>
              <div className={`faq-item__answer${isOpen ? ' faq-item__answer--open' : ''}`} id={panelId} aria-hidden={!isOpen}>
                <div><p>{answer}</p></div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
