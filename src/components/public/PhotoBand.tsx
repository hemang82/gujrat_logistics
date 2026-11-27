'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ensureGsapRegistered, prefersReducedMotion } from '@/lib/gsap';
import { ASSETS } from '@/lib/assets';
import { AssetSlotView } from './AssetSlot';
import { WordFillText } from './WordFill';

export function PhotoBand() {
  const sectionRef = useRef<HTMLElement>(null);
  const photoInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const photoEl = photoInnerRef.current;
    if (!section || !photoEl) return;

    const { gsap } = ensureGsapRegistered();
    const storyWords = gsap.utils.toArray<HTMLElement>('[data-story-word]', section);

    if (prefersReducedMotion()) {
      photoEl.style.transform = 'scale(1)';
      storyWords.forEach((w) => {
        w.style.color = '#FFFFFF';
      });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        photoEl,
        { scale: 1.08 },
        {
          scale: 1.0,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        }
      );

      if (storyWords.length > 0) {
        gsap.fromTo(
          storyWords,
          { color: '#9CD8D1' },
          {
            color: '#FFFFFF',
            stagger: 0.03,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top 78%',
              end: 'top 25%',
              scrub: 0.6,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="shipping-made-easy-heading"
      className="bg-white py-14 md:py-24 border-t border-[#0F766E]/10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-[#0F766E]/15">
          <div ref={photoInnerRef} className="will-change-transform origin-center">
            <AssetSlotView
              asset={ASSETS.hero.sitePhoto}
              sizes="(max-width: 768px) 100vw, 1280px"
              className="w-full min-h-[165px] sm:min-h-[240px] md:min-h-[300px] md:max-h-[310px]"
            />
          </div>
        </div>

        {/* Merged Story & Dispatch Clarity Floating Teal Card */}
        {/* <div className="mt-3 md:mt-0 md:absolute md:bottom-4 md:right-10 lg:right-12 max-w-md rounded-3xl bg-[#0A4F4A] text-white p-4 sm:p-5 shadow-[0_24px_60px_rgba(6,38,42,0.35)] border border-[#2DD4BF]/25">
          <p className="text-sm font-bold uppercase tracking-wider text-[#2DD4BF]">
            Dispatch Clarity · Built For Daily Dispatch Floors
          </p>
          <h2
            id="shipping-made-easy-heading"
            className="mt-1 text-xl sm:text-2xl font-extrabold tracking-tight text-white"
          >
            Shipping made easy
          </h2>
          <WordFillText
            as="p"
            text="One system for the booking counter, the dispatch desk and the accounts team. Every full truckload and every part load has a story: a booking, a vehicle, a challan and a delivery. We keep it accurate from the first LR to the final bill."
            baseColor="#9CD8D1"
            wordAttr="data-story-word"
            className="mt-1.5 text-base leading-snug"
          />
          <Link
            href="/request-a-demo/"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-[#06262A] font-extrabold text-sm px-5 py-2.5 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Request a Demo
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div> */}
      </div>
    </section>
  );
}
