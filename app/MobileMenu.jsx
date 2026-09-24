'use client';

import { useRef, useState } from 'react';
import { useLocale } from './locale';
import { messengerChannels, contactPhone } from './contact-config';

export default function MobileMenu({ navigation }) {
  const { t } = useLocale();
  const dialogRef = useRef(null);
  const toggleRef = useRef(null);
  const restoreFocusRef = useRef(true);
  const [open, setOpen] = useState(false);

  function openMenu() {
    dialogRef.current?.showModal();
    setOpen(true);
  }

  function closeMenu(restoreFocus = true) {
    restoreFocusRef.current = restoreFocus;
    dialogRef.current?.close();
  }

  function navigateTo(href) {
    closeMenu(false);
    requestAnimationFrame(() => {
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    });
  }

  return (
    <>
      <button ref={toggleRef} className="mobile-menu-toggle" type="button" aria-label={t.nav.menu} aria-expanded={open} aria-controls="mobile-menu" onClick={openMenu}>
        <span>{t.nav.menu}</span><span aria-hidden="true">☰</span>
      </button>
      <dialog id="mobile-menu" className="mobile-menu" ref={dialogRef} aria-label={t.nav.aria} onClose={() => { setOpen(false); if (restoreFocusRef.current) toggleRef.current?.focus(); restoreFocusRef.current = true; }}>
        <div className="mobile-menu__top">
          <span>Ладна Хата</span>
          <button type="button" onClick={() => closeMenu()} aria-label={t.nav.close}>✕</button>
        </div>
        <nav aria-label={t.nav.aria}>
          {navigation.map(([label, href], index) => (
            <a href={href} key={href} onClick={() => navigateTo(href)} style={{ '--menu-delay': `${index * 55}ms` }}>
              <small>{String(index + 1).padStart(2, '0')}</small><span>{label}</span><span aria-hidden="true">↗</span>
            </a>
          ))}
        </nav>
        <div className="mobile-menu__contacts">
          {messengerChannels.map((channel) => <a key={channel.name} href={channel.href} onClick={() => closeMenu(false)}>{channel.name}</a>)}
          <a href={`tel:${contactPhone.international}`} onClick={() => closeMenu(false)}>{contactPhone.international}</a>
        </div>
      </dialog>
    </>
  );
}
