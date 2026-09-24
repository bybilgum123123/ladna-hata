'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLocale } from './locale';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ScrollExpand() {
  const { t } = useLocale();
  const sectionRef = useRef(null);
  const frameRef = useRef(null);

  useGSAP(() => {
    if (window.matchMedia('(max-width: 760px), (prefers-reduced-motion: reduce)').matches) return;
    const tween = gsap.fromTo(
      frameRef.current,
      { scale: 0.82 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          end: 'top 20%',
          scrub: 0.6,
        },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, { scope: sectionRef });

  return (
    <section className="scroll-expand" ref={sectionRef} aria-labelledby="expand-title">
      <div className="scroll-expand__frame" ref={frameRef}>
        <Image
          src="/images/site/bedroom.png"
          alt={t.expand.alt}
          fill
          sizes="(max-width: 760px) 100vw, 92vw"
          loading="lazy"
        />
      </div>
      <div className="scroll-expand__copy page-width">
        <p>{t.expand.eyebrow}</p>
        <h2 id="expand-title">{t.expand.title}</h2>
        <span>{t.expand.detail}</span>
      </div>
    </section>
  );
}
