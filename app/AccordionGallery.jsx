'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { useLocale } from './locale';

export default function AccordionGallery({ images }) {
  const { locale, t } = useLocale();
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRefs = useRef([]);
  const touchStartX = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const localizedImages = images.map((image) => locale === 'ru' ? { ...image, title: image.titleRu, alt: image.altRu } : image);
  const activeImage = localizedImages[activeIndex];
  const panels = localizedImages;

  function openGallery(index, trigger) {
    triggerRef.current = trigger;
    setActiveIndex(index);
    dialogRef.current?.showModal();
  }

  function closeGallery() {
    dialogRef.current?.close();
  }

  function changeImage(direction) {
    setActiveIndex((current) => (current + direction + images.length) % images.length);
  }

  function moveImage(event) {
    if (event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--image-x', `${((event.clientX - bounds.left) / bounds.width - 0.5) * 12}px`);
    event.currentTarget.style.setProperty('--image-y', `${((event.clientY - bounds.top) / bounds.height - 0.5) * 12}px`);
  }

  function focusNext(event, index) {
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1
      : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    const nextIndex = (index + direction + panels.length) % panels.length;
    setActiveIndex(nextIndex);
    panelRefs.current[nextIndex]?.focus();
  }

  return (
    <>
      <div className="work-accordion" role="list" aria-label={t.works.aria}>
        {panels.map((image, index) => (
          <figure className={`work-card${activeIndex === index ? ' work-card--active' : ''}`} role="listitem" key={image.src}>
            <button
              ref={(element) => { panelRefs.current[index] = element; }}
              className="work-card__button"
              type="button"
              aria-label={`${t.works.open}: ${image.title}`}
              aria-current={activeIndex === index ? 'true' : undefined}
              onClick={(event) => openGallery(index, event.currentTarget)}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onPointerMove={moveImage}
              onPointerLeave={(event) => {
                event.currentTarget.style.setProperty('--image-x', '0px');
                event.currentTarget.style.setProperty('--image-y', '0px');
              }}
              onKeyDown={(event) => focusNext(event, index)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(max-width: 760px) 90vw, (max-width: 1100px) 50vw, 48vw"
                loading="lazy"
              />
              <span className="work-card__label" aria-hidden="true">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span>{image.title}</span>
                <span>↗</span>
              </span>
            </button>
          </figure>
        ))}
      </div>
      <dialog
        ref={dialogRef}
        className="gallery-dialog"
        aria-labelledby="gallery-title"
        onClose={() => triggerRef.current?.focus()}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') { event.preventDefault(); changeImage(1); }
          if (event.key === 'ArrowLeft') { event.preventDefault(); changeImage(-1); }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeGallery();
        }}
      >
        <div className="gallery-dialog__content">
          <div className="gallery-dialog__topline">
            <span>{String(activeIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
            <button type="button" onClick={closeGallery} aria-label={t.works.close}>{t.works.close} ✕</button>
          </div>
          <Image
            src={activeImage.src}
            alt={activeImage.alt}
            width={activeImage.width}
            height={activeImage.height}
            sizes="(max-width: 760px) 95vw, 85vw"
            className="gallery-dialog__image"
            onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }}
            onTouchEnd={(event) => {
              const distance = event.changedTouches[0].clientX - touchStartX.current;
              if (Math.abs(distance) > 55) changeImage(distance < 0 ? 1 : -1);
            }}
          />
          <div className="gallery-dialog__bottomline">
            <button type="button" onClick={() => changeImage(-1)} aria-label={t.works.previous}>←</button>
            <h3 id="gallery-title">{activeImage.title}</h3>
            <button type="button" onClick={() => changeImage(1)} aria-label={t.works.next}>→</button>
          </div>
        </div>
      </dialog>
    </>
  );
}
