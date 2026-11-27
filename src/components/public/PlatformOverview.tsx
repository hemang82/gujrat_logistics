'use client';

import { useEffect, useRef } from 'react';
import { ensureGsapRegistered, prefersReducedMotion } from '@/lib/gsap';
import { WordFillText } from './WordFill';

const OVERVIEW_PILLARS = [
  {
    eyebrow: 'Dispatch Desk',
    text: 'Book LRs, issue lorry challans and crossing memos, arrange lorry hire and follow each consignment through to delivery.',
  },
  {
    eyebrow: 'Compliance Built In',
    text: 'Generate GSP e-way bills and consolidated e-way bills from the same LR and challan data, so nothing is typed twice.',
  },
  {
    eyebrow: 'Accounts Clarity',
    text: 'Raise freight bills, handle Paid, To-Pay and TBB consignments, and see branch cash books and party ledgers clearly.',
  },
];

export function PlatformOverview() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const words = Array.from(section.querySelectorAll<HTMLElement>('[data-overview-word]'));
    if (words.length === 0) return;

    if (prefersReducedMotion()) {
      words.forEach((w) => {
        w.style.color = '#FFFFFF';
      });
      return;
    }

    let played = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (played || !entries.some((e) => e.isIntersecting)) return;
        played = true;
        observer.disconnect();
        const { gsap } = ensureGsapRegistered();
        gsap.fromTo(
          words,
          { color: '#99D5CF' },
          {
            color: '#FFFFFF',
            stagger: 0.018,
            duration: 0.36,
            ease: 'power1.out',
          }
        );
      },
      { threshold: 0.25 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="who-we-are-heading"
      className="bg-[#0F766E] text-white py-14 md:py-24 border-t border-white/15"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#CCFBF1] mb-2">
          WHO WE ARE
        </p>

        <WordFillText
          id="who-we-are-heading"
          as="h2"
          text="Trust Logistic gives Indian transporters one dependable system for the daily work of road freight: booking consignments, dispatching full and part loads, staying e-way bill compliant, and closing every trip with accurate billing and accounts."
          baseColor="#99D5CF"
          wordAttr="data-overview-word"
          className="text-xl sm:text-xl md:text-[24px] font-semibold tracking-tight max-w-6xl"
        />

        <div className="mt-5 md:mt-7 pt-5 md:pt-6 border-t border-white/20 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {OVERVIEW_PILLARS.map((pillar) => (
            <div
              key={pillar.eyebrow}
              className="rounded-2xl bg-[#0A4F4A]/45 border border-white/15 p-3.5 sm:p-4"
            >
              <p className="text-sm font-bold uppercase tracking-wider text-[#CCFBF1]">
                {pillar.eyebrow}
              </p>
              <p className="mt-1 text-xs text-white/95 leading-snug">
                {pillar.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
