'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ScrollFloatHeading({ id, text }) {
  const ref = useRef(null);
  useGSAP(() => {
    if (window.matchMedia('(max-width: 760px), (prefers-reduced-motion: reduce)').matches) return;
    const tween = gsap.fromTo(ref.current,
      { y: 34, scale: 0.975 },
      { y: 0, scale: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true } });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, { scope: ref });
  return <h2 id={id} className="scroll-float-heading" ref={ref}>{text}</h2>;
}
