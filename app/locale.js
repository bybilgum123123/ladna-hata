'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { translations } from './translations';

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState('uk');

  useEffect(() => {
    try {
      if (localStorage.getItem('ladna-hata-locale') === 'ru') setLocale('ru');
    } catch { /* Storage can be unavailable in private browsing. */ }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = locale === 'ru'
      ? 'Ладна Хата — ремонт квартир и коттеджей в Ужгороде'
      : 'Ладна Хата — ремонт квартир та котеджів в Ужгороді';
  }, [locale]);

  function changeLocale(nextLocale) {
    if (nextLocale !== 'uk' && nextLocale !== 'ru') return;
    setLocale(nextLocale);
    try { localStorage.setItem('ladna-hata-locale', nextLocale); } catch { /* Keep the current selection for this visit. */ }
  }

  return <LocaleContext.Provider value={{ locale, setLocale: changeLocale, t: translations[locale] }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('LocaleProvider is required');
  return context;
}
