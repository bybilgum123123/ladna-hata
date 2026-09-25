import MobileMenu from './MobileMenu';
import { useLocale } from './locale';

export default function HeaderActions({ navigation }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="header-actions">
      <div className="locale-switch" role="group" aria-label="Мова / Язык">
        <button type="button" lang="uk" aria-pressed={locale === 'uk'} onClick={() => setLocale('uk')}>УКР</button>
        <button type="button" lang="ru" aria-pressed={locale === 'ru'} onClick={() => setLocale('ru')}>РУС</button>
      </div>
      <a className="header-cta" href="#contact">
        <span>{t.nav.discuss}</span>
        <span className="header-cta__arrow" aria-hidden="true">↗</span>
      </a>
      <MobileMenu navigation={navigation} />
    </div>
  );
}
