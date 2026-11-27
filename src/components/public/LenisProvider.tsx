'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { ensureGsapRegistered, prefersReducedMotion } from '@/lib/gsap';

/**
 * Syncs Lenis smooth scrolling with GSAP ScrollTrigger inside the Home page experience.
 * Automatically disables smooth scroll overrides when user prefers reduced motion.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const { gsap, ScrollTrigger } = ensureGsapRegistered();

    if (prefersReducedMotion()) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
