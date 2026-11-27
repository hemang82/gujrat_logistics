'use client';

import { useEffect, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ensureGsapRegistered, prefersReducedMotion } from '@/lib/gsap';
import { LeadForm } from './LeadForm';

export function FinalScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const card = containerCardRef.current;
    if (!section || !card || prefersReducedMotion()) return;

    const { gsap } = ensureGsapRegistered();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        card,
        { y: 56 },
        {
          y: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 84%',
            end: 'top 36%',
            scrub: 0.7,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="final-cta-heading"
      className="relative bg-[#F3F7F7] pt-0 overflow-hidden"
    >
      {/* Monumental "TRUST" display backdrop behind rising container */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none text-center overflow-hidden px-4 -mb-4 sm:-mb-7 md:-mb-11"
      >
        <span className="block text-[12vw] md:text-[8.5vw] font-black leading-[0.8] tracking-[-0.05em] text-[#06262A]/[0.075]">
          TRUST
        </span>
      </div>

      {/* Rising Ribbed Dark-Teal Container Card */}
      <div
        ref={containerCardRef}
        className="relative z-10 rounded-t-[1.75rem] sm:rounded-t-[2.25rem] md:rounded-t-[3rem] bg-[#0A4F4A] container-ribbed-bg text-white py-14 md:py-24 px-4 sm:px-6 lg:px-8 will-change-transform shadow-[0_-24px_60px_rgba(6,38,42,0.18)]"
      >
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-10 items-center">
          <div className="lg:col-span-5 space-y-2.5 sm:space-y-3.5">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#2DD4BF]">
              Get Started
            </p>
            <h2
              id="final-cta-heading"
              className="text-2xl sm:text-4xl lg:text-[2.65rem] font-extrabold text-white tracking-tight leading-[1.1]"
            >
              Ready to digitize your transport business?
            </h2>
            <p className="text-base text-white/90 leading-snug">
              See how LR, challan, e-way bill and billing work together for your FTL and PTL operations.
            </p>

            <ul className="space-y-1.5 pt-1">
              {[
                'See the full LR-to-bill flow live',
                'Walk through FTL and PTL workflows for your business',
                'Get clear answers on modules and pricing',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-base font-medium text-white leading-snug"
                >
                  <CheckCircle2
                    className="w-4.5 h-4.5 text-[#2DD4BF] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <LeadForm variant="dark" sourceLabel="Request a Demo" />
          </div>
        </div>
      </div>
    </section>
  );
}
