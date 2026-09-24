'use client';

import { useEffect, useState } from 'react';
import { contactPhone, messengerChannels } from './contact-config';
import { useLocale } from './locale';
import ContactIcon from './ContactIcon';

export default function ContactDock() {
  const { t } = useLocale();
  const [showFallback, setShowFallback] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const [nearContact, setNearContact] = useState(false);

  useEffect(() => {
    const dock = document.querySelector('.contact-dock');
    const targets = [
      document.querySelector('#services'),
      document.querySelector('#prices'),
      document.querySelector('#works'),
      document.querySelector('#faq'),
      document.querySelector('#contact'),
      document.querySelector('.site-footer'),
    ].filter(Boolean);
    let frame = 0;
    const update = () => {
      frame = 0;
      const dockBox = dock.getBoundingClientRect();
      const overlaps = targets.some((target) => {
        const box = target.getBoundingClientRect();
        return box.bottom > dockBox.top - 12 && box.top < dockBox.bottom + 12;
      });
      setNearContact(overlaps);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(contactPhone.international);
      setCopyStatus(t.dock.copied);
    } catch {
      setCopyStatus(t.dock.manual);
    }
  }

  return (
    <nav className={`contact-dock${nearContact ? ' contact-dock--hidden' : ''}`} aria-label={t.dock.aria} aria-hidden={nearContact} inert={nearContact}>
      {showFallback && (
        <div className="contact-dock__fallback">
          <p>{t.dock.viberFallback}</p>
          <span>{contactPhone.international}</span>
          <button type="button" onClick={copyNumber}>{t.dock.copy}</button>
          <small role="status" aria-live="polite">{copyStatus}</small>
        </div>
      )}
      <div className="contact-dock__links">
        {messengerChannels.map((channel) => (
          <a key={channel.name} href={channel.href} onClick={channel.name === 'Viber' ? () => setShowFallback(true) : undefined} aria-label={`${t.dock.write} ${channel.name}`} data-tip={channel.name}>
            <ContactIcon name={channel.name} />
          </a>
        ))}
        <a href={`tel:${contactPhone.international}`} aria-label={`${t.dock.call}: ${contactPhone.display}`} data-tip={t.dock.phone}><ContactIcon name="Phone" /></a>
      </div>
    </nav>
  );
}
