"use client";
import Image from "next/image";
import AccordionGallery from "./AccordionGallery";
import BrandMark from "./BrandMark";
import ContactDock from "./ContactDock";
import ContactRequest from "./ContactRequest";
import Faq from "./Faq";
import HeaderActions from "./HeaderActions";
import ScrollExpand from "./ScrollExpand";
import ScrollFloatHeading from "./ScrollFloatHeading";
import ScrollReveal from "./ScrollReveal";
import ServiceBento from "./ServiceBento";
import SplitHeading from "./SplitHeading";
import { galleryImages } from "./content";
import { contactPhone, messengerChannels } from "./contact-config";
import { useLocale } from "./locale";

export default function Home() {
  const { t } = useLocale();
  const navigation = [[t.nav.services, "#services"], [t.nav.prices, "#prices"], [t.nav.works, "#works"], [t.nav.contacts, "#contact"]];
  return <>
    <ScrollReveal />
    <header className="site-header" id="top">
      <BrandMark />
      <nav className="main-nav" aria-label={t.nav.aria}>{navigation.map(([label, href]) => <a href={href} key={href}>{label}</a>)}</nav>
      <HeaderActions navigation={navigation} />
    </header>
    <main>
      <section className="hero page-width" aria-labelledby="hero-title">
        <Image className="hero__image" src="/images/site/bedroom.png" alt={t.hero.imageAlt} fill priority sizes="(max-width: 760px) 100vw, 92vw" />
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow"><span aria-hidden="true" />{t.hero.area}</p>
          <SplitHeading as="h1" id="hero-title" text={t.hero.title} />
          <p className="hero__description">{t.hero.description}</p>
          <div className="hero__actions"><a className="button button--primary" href="#contact">{t.hero.estimate}<span aria-hidden="true">↗</span></a><a className="button button--quiet" href="#works">{t.hero.view}</a></div>
        </div>
        <p className="hero__image-caption">{t.hero.bedroom}</p>
      </section>
      <section className="intro-band" id="services" aria-labelledby="services-title">
        <div className="intro-band__inner page-width"><p className="eyebrow eyebrow--light"><span aria-hidden="true" />{t.services.eyebrow}</p><SplitHeading id="services-title" text={t.services.title.join(" ")} /><div className="intro-band__text"><p>{t.services.description}</p><a className="text-link" href="#contact">{t.services.discuss}<span aria-hidden="true">↗</span></a></div></div>
        <ServiceBento />
      </section>
      <ScrollExpand />
      <section className="work-section page-width" id="works" aria-labelledby="works-title"><div className="section-heading"><div><p className="eyebrow"><span aria-hidden="true" />{t.works.aside.join(" ")}</p><ScrollFloatHeading id="works-title" text={t.works.title} /></div></div><AccordionGallery images={galleryImages.slice(0, 6)} /></section>
      <section className="proof-section" aria-labelledby="proof-title"><div className="proof-section__inner page-width"><div className="proof-section__image" data-reveal><Image src="/images/site/bathroom-dark.png" alt={t.proof.photoAlt} fill sizes="(max-width: 768px) 100vw, 43vw" /></div><div className="proof-section__copy"><SplitHeading id="proof-title" text={t.proof.title.join(" ")} /><div className="proof-list">{t.proof.items.map((item) => <p key={item}><span className="editorial-dot" aria-hidden="true" />{item}</p>)}</div></div></div></section>
      <section className="process-section" id="process" aria-labelledby="process-title"><div className="process-section__inner page-width"><div className="process-section__copy"><p className="eyebrow"><span aria-hidden="true" />{t.process.eyebrow}</p><SplitHeading id="process-title" text={t.process.title.join(" ")} /><p>{t.process.description}</p><a className="button button--light" href="#contact">{t.process.ask}<span aria-hidden="true">↗</span></a></div><div className="process-section__image" data-reveal><Image src="/images/site/hero.png" alt={t.process.photoAlt} fill sizes="(max-width: 768px) 100vw, 46vw" /></div></div></section>
      <Faq />
      <section className="contact-section page-width" id="contact" aria-labelledby="contact-title"><div className="contact-section__copy"><p className="eyebrow"><span aria-hidden="true" />{t.contact.eyebrow}</p><SplitHeading id="contact-title" text={t.contact.title} /><p>{t.contact.direct}</p><div className="contact-section__image" data-reveal><Image src="/images/site/bathroom_white.png" alt={t.contact.photoAlt} fill sizes="(max-width: 768px) 100vw, 38vw" /></div></div><ContactRequest /></section>
    </main>
    <ContactDock />
    <footer className="site-footer"><a className="wordmark wordmark--footer" href="#top"><span className="wordmark__symbol" aria-hidden="true">Л</span><span className="wordmark__text"><strong>Ладна</strong> Хата</span></a><p>{t.footer.tagline}</p><div className="site-footer__contacts" aria-label={t.footer.aria}>{messengerChannels.map((channel) => <a key={channel.name} href={channel.href}>{channel.name}</a>)}<a href={"tel:" + contactPhone.international}>{t.footer.phone}</a></div><a className="footer-top" href="#top">{t.footer.top} ↑</a></footer>
  </>;
}
