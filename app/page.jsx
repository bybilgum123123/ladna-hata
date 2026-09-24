"use client";
import Image from "next/image";
import AccordionGallery from "./AccordionGallery";
import ContactDock from "./ContactDock";
import ContactRequest from "./ContactRequest";
import PriceAmount from "./PriceAmount";
import Faq from "./Faq";
import MobileMenu from "./MobileMenu";
import Reviews from "./Reviews";
import RotatingAccent from "./RotatingAccent";
import ScrollExpand from "./ScrollExpand";
import ScrollFloatHeading from "./ScrollFloatHeading";
import ScrollReveal from "./ScrollReveal";
import ServiceBento from "./ServiceBento";
import SplitHeading from "./SplitHeading";
import { galleryImages } from "./content";
import { contactPhone, messengerChannels } from "./contact-config";
import { useLocale } from "./locale";

export default function Home() {
  const { locale, setLocale, t } = useLocale();
  const navigation = [[t.nav.services, "#services"], [t.nav.prices, "#prices"], [t.nav.works, "#works"], [t.nav.contacts, "#contact"]];
  function moveHero(event) {
    if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const frame = event.currentTarget;
    const rect = frame.getBoundingClientRect();
    frame.style.setProperty("--hero-x", ((event.clientX - rect.left) / rect.width - 0.5) * 14 + "px");
    frame.style.setProperty("--hero-y", ((event.clientY - rect.top) / rect.height - 0.5) * 14 + "px");
  }
  function resetHero(event) {
    event.currentTarget.style.setProperty("--hero-x", "0px");
    event.currentTarget.style.setProperty("--hero-y", "0px");
  }
  return <>
    <ScrollReveal />
    <header className="site-header" id="top">
      <a className="wordmark" href="#top" aria-label="Ладна Хата"><span className="wordmark__symbol" aria-hidden="true">Л</span><span className="wordmark__text"><strong>Ладна</strong> Хата</span></a>
      <nav className="main-nav" aria-label={t.nav.aria}>{navigation.map(([label, href]) => <a href={href} key={href}>{label}</a>)}</nav>
      <div className="header-actions">
        <div className="locale-switch" role="group" aria-label="Мова / Язык">
          <button type="button" lang="uk" aria-pressed={locale === "uk"} onClick={() => setLocale("uk")}>УКР</button><span aria-hidden="true">/</span><button type="button" lang="ru" aria-pressed={locale === "ru"} onClick={() => setLocale("ru")}>РУС</button>
        </div>
        <a className="header-link" href="#contact">{t.nav.discuss}<span aria-hidden="true">↗</span></a>
        <MobileMenu navigation={navigation} />
      </div>
    </header>
    <main>
      <section className="hero page-width" aria-labelledby="hero-title">
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow"><span aria-hidden="true" />{t.hero.area}</p>
          <SplitHeading as="h1" id="hero-title" text={t.hero.title} />
          <p className="hero__description">{t.hero.description}</p>
          <div className="hero__actions"><a className="button button--primary" href="#contact">{t.hero.estimate}<span aria-hidden="true">↗</span></a><a className="button button--quiet" href="#works">{t.hero.view}</a></div>
          <RotatingAccent />
        </div>
        <div className="hero__visual">
          <div className="hero__image-frame" onPointerMove={moveHero} onPointerLeave={resetHero}><Image className="hero__image" src="/images/site/bedroom.png" alt={t.hero.imageAlt} fill priority sizes="(max-width: 768px) 100vw, 56vw" /></div>
          <p className="hero__image-caption"><span className="caption-line" />{t.hero.photo} · {t.hero.bedroom}</p>
        </div>
      </section>
      <section className="intro-band" id="services" aria-labelledby="services-title">
        <div className="intro-band__inner page-width"><p className="eyebrow eyebrow--light"><span aria-hidden="true" />{t.services.eyebrow}</p><SplitHeading id="services-title" text={t.services.title.join(" ")} /><div className="intro-band__text"><p>{t.services.description}</p><a className="text-link" href="#contact">{t.services.discuss}<span aria-hidden="true">↗</span></a></div></div>
        <ServiceBento />
      </section>
      <section className="price-section page-width" id="prices" aria-labelledby="prices-title">
        <div className="section-heading"><div><p className="eyebrow"><span aria-hidden="true" />{t.prices.aside.join(" ")}</p><SplitHeading id="prices-title" text={t.prices.title} /></div></div>
        <div className="price-grid">{t.prices.featured.map((item) => <article className="price-card" key={item.value} data-reveal><p className="price-card__label">{item.label}</p><h3>{item.title}</h3><div className="price-card__value"><PriceAmount prefix={t.prices.from} value={item.value} currency={item.currency} unit={item.unit} />{item.basis && <span className="price-card__basis">{item.basis}</span>}</div><p className="price-card__detail">{item.detail}</p></article>)}</div>
        <div className="additional-prices"><h3>{t.prices.other}</h3><div>{t.prices.additional.map((item) => <div className="additional-prices__row" key={item.value}><span>{item.name}</span><PriceAmount prefix={t.prices.from} value={item.value} currency={item.currency} unit={item.unit} compact /></div>)}</div></div>
        <p className="price-section__note">{t.prices.note}</p>
      </section>
      <ScrollExpand />
      <section className="work-section page-width" id="works" aria-labelledby="works-title"><div className="section-heading"><div><p className="eyebrow"><span aria-hidden="true" />{t.works.aside.join(" ")}</p><ScrollFloatHeading id="works-title" text={t.works.title} /></div></div><AccordionGallery images={galleryImages.slice(0, 6)} /></section>
      <section className="proof-section" aria-labelledby="proof-title"><div className="proof-section__inner page-width"><div className="proof-section__image" data-reveal><Image src="/images/site/bathroom-dark.png" alt={t.proof.photoAlt} fill sizes="(max-width: 768px) 100vw, 43vw" /></div><div className="proof-section__copy"><SplitHeading id="proof-title" text={t.proof.title.join(" ")} /><div className="proof-list">{t.proof.items.map((item, index) => <p key={item}><span>0{index + 1}</span>{item}</p>)}</div></div></div></section>
      <section className="process-section" id="process" aria-labelledby="process-title"><div className="process-section__inner page-width"><div className="process-section__copy"><p className="eyebrow"><span aria-hidden="true" />{t.process.eyebrow}</p><SplitHeading id="process-title" text={t.process.title.join(" ")} /><p>{t.process.description}</p><a className="button button--light" href="#contact">{t.process.ask}<span aria-hidden="true">↗</span></a></div><div className="process-section__image" data-reveal><Image src="/images/site/hero.png" alt={t.process.photoAlt} fill sizes="(max-width: 768px) 100vw, 46vw" /></div></div></section>
      <Reviews /><Faq />
      <section className="contact-section page-width" id="contact" aria-labelledby="contact-title"><div className="contact-section__copy"><p className="eyebrow"><span aria-hidden="true" />{t.contact.eyebrow}</p><SplitHeading id="contact-title" text={t.contact.title} /><p>{t.contact.direct}</p><div className="contact-section__image" data-reveal><Image src="/images/site/bathroom_white.png" alt={t.contact.photoAlt} fill sizes="(max-width: 768px) 100vw, 38vw" /></div></div><ContactRequest /></section>
    </main>
    <ContactDock />
    <footer className="site-footer"><a className="wordmark wordmark--footer" href="#top"><span className="wordmark__symbol" aria-hidden="true">Л</span><span className="wordmark__text"><strong>Ладна</strong> Хата</span></a><p>{t.footer.tagline}</p><div className="site-footer__contacts" aria-label={t.footer.aria}>{messengerChannels.map((channel) => <a key={channel.name} href={channel.href}>{channel.name}</a>)}<a href={"tel:" + contactPhone.international}>{t.footer.phone}</a></div><a className="footer-top" href="#top">{t.footer.top} ↑</a></footer>
  </>;
}
