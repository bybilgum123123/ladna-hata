'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export default function SplitHeading({ as: Tag = 'h2', id, text, className = '' }) {
  const headingRef = useRef(null);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const heading = headingRef.current;
    const split = new SplitText(heading, { type: 'words', wordsClass: 'split-heading__word' });
    const tween = gsap.fromTo(
      split.words,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.045,
        ease: 'power3.out',
        scrollTrigger: { trigger: heading, start: 'top 90%', once: true },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      split.revert();
    };
  }, { scope: headingRef });

  return <Tag ref={headingRef} id={id} className={`split-heading ${className}`} aria-label={text}>{text}</Tag>;
}
