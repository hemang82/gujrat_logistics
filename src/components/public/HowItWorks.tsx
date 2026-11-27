'use client';

import { useEffect, useRef } from 'react';
import { ensureGsapRegistered, prefersReducedMotion } from '@/lib/gsap';
import { DemoCtaRow, SectionHeader } from './SectionHeader';
import { Truck } from './Truck';

const STEPS = [
  {
    number: '01',
    title: 'Book & LR',
    description:
      'Book a full or part load, create the LR with party, route and goods details, and issue the lorry challan.',
  },
  {
    number: '02',
    title: 'E-way Bill',
    description:
      'Generate the e-way bill through GSP, or a consolidated e-way bill when one vehicle carries several consignments.',
  },
  {
    number: '03',
    title: 'Dispatch & Track',
    description:
      'Dispatch the vehicle, record crossing memos for branch transfers and follow each consignment to delivery.',
  },
  {
    number: '04',
    title: 'Deliver & Bill',
    description:
      'Confirm delivery, raise the freight bill and update party ledgers and branch cash books.',
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackWrapRef = useRef<HTMLDivElement>(null);
  const miniTruckRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackWrapRef.current;
    const miniTruck = miniTruckRef.current;
    if (!section || !track || !miniTruck || prefersReducedMotion()) return;

    const { gsap } = ensureGsapRegistered();

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Desktop horizontal timeline scrub with small truck rolling left along track
      mm.add('(min-width: 768px)', () => {
        const calcTrackDistance = () =>
          Math.max(track.clientWidth - miniTruck.clientWidth, 160);

        const wheels = gsap.utils.toArray<HTMLElement>(
          '[data-truck-wheel]',
          miniTruck
        );

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 74%',
            end: 'bottom 60%',
            scrub: 0.75,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(
          miniTruck,
          { x: () => calcTrackDistance() },
          { x: 0, ease: 'none' },
          0
        );

        wheels.forEach((wheel) => {
          const origin = wheel.getAttribute('data-wheel-origin') || undefined;
          tl.to(
            wheel,
            {
              rotation: -720,
              ...(origin ? { svgOrigin: origin } : { transformOrigin: '50% 50%' }),
              ease: 'none',
            },
            0
          );
        });

        if (progressBarRef.current) {
          tl.fromTo(
            progressBarRef.current,
            { scaleX: 0 },
            { scaleX: 1, transformOrigin: 'left center', ease: 'none' },
            0
          );
        }
      });

      return () => mm.revert();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      aria-labelledby="how-it-works-heading"
      className="bg-white text-[#06262A] py-14 md:py-24 border-t border-[#0F766E]/10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          headingId="how-it-works-heading"
          tone="light"
          eyebrow="How It Works"
          title="Four connected steps from booking counter to invoice settlement."
          subtitle="Keep every trip moving cleanly from digital LR entry to freight billing and cash reconciliation."
        />

        {/* Desktop Animated Horizontal Track */}
        <div
          ref={trackWrapRef}
          className="hidden md:block relative mb-4 pt-7 pb-1"
          aria-hidden="true"
        >
          <div className="h-1.5 w-full rounded-full bg-[#0F766E]/15 overflow-hidden">
            <div
              ref={progressBarRef}
              className="h-full w-full bg-[#0F766E] will-change-transform"
            />
          </div>
          <div
            ref={miniTruckRef}
            className="absolute top-0 left-0 w-24 will-change-transform"
          >
            <Truck compact />
          </div>
        </div>

        {/* 2x2 Grid (<= 3 per row desktop, 1 per row mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4">
          {STEPS.map((item) => (
            <div
              key={item.number}
              className="rounded-2xl bg-[#F3F7F7] p-3.5 sm:p-4 border border-[#0F766E]/12 hover:border-[#0F766E]/35 hover:shadow-[0_14px_32px_rgba(15,118,110,0.08)] transition-all"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="inline-flex items-center justify-center rounded-full bg-[#0F766E] text-white text-sm font-extrabold px-2.5 py-0.5 shrink-0">
                  Step {item.number}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#06262A]">
                  {item.title}
                </h3>
              </div>
              <p className="text-base text-[#52666B] leading-snug">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <DemoCtaRow
          tone="light"
          surface="tint"
          prompt="Walk through the live 4-step transport workflow with our product team."
        />
      </div>
    </section>
  );
}
