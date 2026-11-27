'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ensureGsapRegistered, prefersReducedMotion } from '@/lib/gsap';
import { APPROVED_HERO_METRICS } from '@/content/proof';
import { Truck } from './Truck';
import { WordFillText } from './WordFill';

interface HeroProps {
  hasCustomTruckWebp?: boolean;
}

const CONFIRMED_PILLARS = [
  {
    title: 'LR, Challan & Crossing',
    detail: 'Booking to lorry hire in one connected flow.',
  },
  {
    title: 'E-Way Bill & CEWB',
    detail: 'Created from your LR and challan data.',
  },
  {
    title: 'Billing & Accounts',
    detail: 'Paid, To-Pay and TBB billing with branch cash books.',
  },
];

export function Hero({ hasCustomTruckWebp = false }: HeroProps) {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const truckWrapRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const backdropWordsRef = useRef<HTMLDivElement>(null);
  const mobileTrustRef = useRef<HTMLSpanElement>(null);
  const roadLineRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLButtonElement>(null);
  const statementWrapRef = useRef<HTMLDivElement>(null);

  const hasMetrics = APPROVED_HERO_METRICS.length > 0;

  const handleScrollExplore = () => {
    const targetTop =
      window.innerWidth >= 768
        ? Math.round(window.innerHeight * 1.1)
        : Math.round(window.innerHeight * 0.65);
    window.scrollTo({
      top: targetTop,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    const stage = stageRef.current;
    const truckEl = truckWrapRef.current;
    if (!container || !stage || !truckEl) return;

    const { gsap, ScrollTrigger } = ensureGsapRegistered();

    // Respect user prefers-reduced-motion with static stacked layout (zero overlap)
    if (prefersReducedMotion()) {
      const fills = stage.querySelectorAll<HTMLElement>('[data-hero-word]');
      fills.forEach((el) => {
        el.style.color = '#06262A';
      });
      return;
    }

    const mm = gsap.matchMedia();

    const setupHeroTimeline = (pinDistance: string) => {
      const words = gsap.utils.toArray<HTMLElement>('[data-hero-word]', stage);
      const wheels = gsap.utils.toArray<HTMLElement>('[data-truck-wheel]', truckEl);

      // Exact drive distance off left edge + matching wheel rotation radius in rendered CSS pixels
      const calcTravelPx = () => {
        const vw = window.innerWidth;
        const rect = truckEl.getBoundingClientRect();
        return vw + Math.max(rect.width, 520) + 140;
      };
      const getWheelRadiusPx = () => {
        const rect = truckEl.getBoundingClientRect();
        return Math.max(28, rect.width * (49 / 980));
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: pinDistance,
          pin: stage,
          scrub: 0.85,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Phase 1 (0 -> 0.44): Truck accelerates LEFT with exact rolling wheel physics;
      // copy, display brand type and scroll cue fade cleanly upward/out.
      tl.to(
        truckEl,
        {
          x: () => -calcTravelPx(),
          ease: 'power2.inOut',
          duration: 0.44,
        },
        0
      );

      wheels.forEach((wheel) => {
        const origin = wheel.getAttribute('data-wheel-origin') || undefined;
        tl.to(
          wheel,
          {
            rotation: () => {
              const distance = calcTravelPx();
              // angle = -distance / wheelRadius (counter-clockwise for leftward motion)
              const radians = -distance / getWheelRadiusPx();
              return (radians * 180) / Math.PI;
            },
            ...(origin ? { svgOrigin: origin } : { transformOrigin: '50% 50%' }),
            ease: 'power2.inOut',
            duration: 0.44,
          },
          0
        );
      });

      const fadeTargets = [introRef.current, scrollCueRef.current].filter(Boolean);

      tl.to(
        fadeTargets,
        {
          autoAlpha: 0,
          y: -36,
          ease: 'power1.out',
          duration: 0.26,
        },
        0.05
      );

      const pinnedTrustTargets = [
        backdropWordsRef.current,
        mobileTrustRef.current,
      ].filter(Boolean);

      if (pinnedTrustTargets.length > 0) {
        // Keep TRUST pinned in place horizontally/vertically and softly fade only after truck passes
        tl.to(
          pinnedTrustTargets,
          {
            autoAlpha: 0,
            ease: 'power1.out',
            duration: 0.16,
          },
          0.26
        );
      }

      if (roadLineRef.current) {
        tl.to(
          roadLineRef.current,
          {
            opacity: 0,
            duration: 0.2,
          },
          0.32
        );
      }

      // Phase 2 (0.34 -> 0.50): Statement rises cleanly into center stage
      tl.fromTo(
        statementWrapRef.current,
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, ease: 'power2.out', duration: 0.16 },
        0.34
      );

      // Phase 3 (0.48 -> 0.90): Word-by-word ink color fill (#B3C1C3 -> #06262A)
      if (words.length > 0) {
        tl.fromTo(
          words,
          { color: '#B3C1C3' },
          {
            color: '#06262A',
            stagger: 0.06,
            ease: 'none',
            duration: 0.42,
          },
          0.48
        );
      }

      // Phase 4 (0.90 -> 1.0): Brief hold before Platform Overview rises
      tl.to({}, { duration: 0.1 }, 0.9);
    };

    // Desktop: 100vh stage + 160% pin = 260vh total; Mobile: 100vh stage + 80% pin = 180vh total
    mm.add('(min-width: 768px)', () => {
      setupHeroTimeline('+=160%');
    });

    mm.add('(max-width: 767px)', () => {
      setupHeroTimeline('+=80%');
    });

    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mm.revert();
    };
  }, []);

  return (
    <section
      id="home-hero"
      ref={containerRef}
      aria-label="Trust Logistic Overview"
      className="relative bg-[#F3F7F7] text-[#06262A]"
    >
      <div
        ref={stageRef}
        className="relative min-h-[100svh] w-full overflow-hidden flex flex-col justify-between pt-24 pb-10 md:pb-6 px-4 sm:px-8 lg:px-12 motion-reduce:h-auto motion-reduce:gap-12"
      >
        {/* Sculptural Brand Stage Backdrop: Radial Mint Aura, Route Arcs & Monumental TRUST Typography */}
        <div
          ref={backdropWordsRef}
          aria-hidden="true"
          className="pointer-events-none select-none absolute inset-0 overflow-hidden z-0"
        >
          {/* Soft atmospheric dot matrix faded cleanly to stage edges */}
          <div
            className="absolute inset-0 opacity-65"
            style={{
              backgroundImage:
                'radial-gradient(rgba(15, 118, 110, 0.16) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              maskImage:
                'radial-gradient(ellipse 68% 72% at 74% 52%, #000 15%, transparent 82%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 68% 72% at 74% 52%, #000 15%, transparent 82%)',
            }}
          />

          {/* Soft ambient teal glow anchoring the right truck corridor */}
          <div className="absolute right-[2%] bottom-[8%] w-[620px] h-[360px] rounded-full bg-[#2DD4BF]/14 blur-3xl" />

          {/* Architectural Curved Route Arcs Visualizing Connected Corridor Flow */}
          <svg
            viewBox="0 0 1440 760"
            fill="none"
            className="hidden md:block absolute inset-0 w-full h-full object-cover opacity-55"
          >
            <path
              d="M720 490 Q 980 240 1340 310"
              stroke="#0F766E"
              strokeOpacity="0.16"
              strokeWidth="1.5"
              strokeDasharray="6 8"
            />
            <path
              d="M840 530 Q 1080 340 1390 420"
              stroke="#0F766E"
              strokeOpacity="0.12"
              strokeWidth="1.5"
            />
            <circle cx="965" cy="330" r="5" fill="#0F766E" fillOpacity="0.28" />
            <circle cx="965" cy="330" r="14" stroke="#2DD4BF" strokeOpacity="0.28" strokeWidth="1.5" />
            <circle cx="1175" cy="292" r="4" fill="#F59E0B" fillOpacity="0.45" />
          </svg>

          {/* Architectural Display Brand Watermark — Desktop Backdrop (Mobile TRUST renders cleanly above truck) */}
          <span className="hidden md:block text-right pr-6 lg:pr-12 pt-[144px] lg:pt-[154px] text-[15.5vw] lg:text-[14.5vw] font-black leading-[0.83] tracking-[-0.042em] text-[#06262A]/[0.055]">
            TRUST
          </span>
        </div>

        {/* Left Column: Clear Goal-Driven Headline, Software Buying CTAs & Feature Highlights */}
        <div
          ref={introRef}
          className="relative z-30 mx-auto w-full max-w-7xl my-0 pt-2 md:pt-[48px] lg:pt-[58px] grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start"
        >
          <div className="md:col-span-6 lg:col-span-6 space-y-4 sm:space-y-5">
            <h1 className="text-[1.875rem] sm:text-4xl lg:text-[3.05rem] font-extrabold text-[#06262A] tracking-[-0.025em] leading-[1.1] sm:leading-[1.09]">
              All-in-One Software to Run Your Transport Business
            </h1>

            <p className="text-base sm:text-[1.0625rem] text-[#52666B] leading-relaxed max-w-xl">
              Trust Logistic is transport management software for Indian transporters, fleet owners and brokers. Create LRs, challans and crossing memos, generate GSP e-way bills, manage vehicles and drivers, and raise freight bills, all in one system built for both FTL and PTL operations.
            </p>

            {/* Primary Software Buying / Demo CTAs */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-3.5 pt-1">
              <Link
                href="/request-a-demo/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-[#06262A] font-extrabold text-base px-7 py-3.5 shadow-[0_12px_28px_rgba(245,158,11,0.3)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06262A]"
              >
                Request a Demo
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                href="/solutions/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#0F766E]/25 bg-white/90 hover:bg-white text-[#0F766E] font-bold text-base px-6 py-3.5 transition-colors shadow-sm"
              >
                See All Features
              </Link>
            </div>

            {/* Compact Mobile Highlights (< md) */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 md:hidden text-sm font-bold text-[#06262A]">
              {CONFIRMED_PILLARS.map((pillar) => (
                <span key={pillar.title} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" aria-hidden="true" />
                  <span>{pillar.title}</span>
                </span>
              ))}
            </div>

            {/* Clean Horizontal 3-Column Capability Highlights */}
            <div className="hidden md:grid grid-cols-3 gap-5 pt-5 mt-2 border-t border-[#06262A]/10 max-w-[640px]">
              {hasMetrics
                ? APPROVED_HERO_METRICS.slice(0, 3).map((metric) => (
                    <div key={metric.label} className="space-y-1">
                      <p className="text-2xl font-extrabold text-[#0F766E] leading-none">
                        {metric.value}
                      </p>
                      <p className="text-sm font-bold text-[#06262A] leading-snug">
                        {metric.label}
                      </p>
                      <p className="text-sm text-[#52666B] leading-snug">
                        {metric.detail}
                      </p>
                    </div>
                  ))
                : CONFIRMED_PILLARS.map((pillar) => (
                    <div key={pillar.title} className="space-y-1">
                      <p className="text-base font-extrabold text-[#06262A] flex items-start gap-2 leading-snug">
                        <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0 mt-1" aria-hidden="true" />
                        <span>{pillar.title}</span>
                      </p>
                      <p className="text-sm text-[#52666B] leading-snug pl-6">
                        {pillar.detail}
                      </p>
                    </div>
                  ))}
            </div>
          </div>
        </div>

        {/* Driving Left Brand Flagship Truck Layer — Right-End Anchored on Mobile & Desktop */}
        <div className="relative z-20 mt-4 md:mt-0 md:contents">
          <span
            ref={mobileTrustRef}
            aria-hidden="true"
            className="md:hidden block text-right text-[14.5vw] font-black leading-[0.84] tracking-[-0.04em] text-[#06262A]/[0.055] mb-1 pointer-events-none select-none"
          >
            TRUST
          </span>
          <div
            ref={truckWrapRef}
            className="pointer-events-none relative md:absolute z-20 right-0 md:right-[2%] lg:right-[3%] bottom-0 md:bottom-[11%] w-[78%] max-w-[300px] sm:w-[68%] sm:max-w-[410px] md:w-[46vw] lg:w-[47vw] md:max-w-[740px] ml-auto will-change-transform motion-reduce:static motion-reduce:mt-4"
          >
            <Truck hasCustomWebp={hasCustomTruckWebp} />
            <div
              aria-hidden="true"
              className="md:hidden h-px w-full bg-gradient-to-r from-transparent via-[#06262A]/20 to-transparent -mt-2"
            />
          </div>
        </div>

        {/* Clean Highway Road Surface & Subtle Center Dash Aligned Directly Under Tires */}
        <div
          ref={roadLineRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[calc(11%+24px)] z-10 hidden md:block motion-reduce:hidden"
        >
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#06262A]/22 to-transparent" />
          <div className="mt-1.5 mx-auto w-[74%] border-t border-dashed border-[#0F766E]/20" />
        </div>

        {/* Clean Desktop Bottom-Center Interactive Scroll Prompt */}
        <button
          ref={scrollCueRef}
          type="button"
          onClick={handleScrollExplore}
          className="hidden md:inline-flex items-center gap-2.5 self-center mx-auto relative z-30 rounded-full bg-white/90 hover:bg-white border border-[#0F766E]/15 px-4 py-2 text-sm font-semibold text-[#52666B] hover:text-[#0F766E] shadow-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] motion-reduce:hidden"
        >
          <span className="w-5 h-5 rounded-full bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center animate-bounce">
            <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          Scroll to explore platform
        </button>

        {/* Pinned Statement Overlay Revealed After Truck Exits Left (Desktop & Mobile Pinned Stage) */}
        <div
          ref={statementWrapRef}
          className="flex pointer-events-none absolute inset-0 z-30 items-center justify-center px-6 opacity-0 motion-reduce:static motion-reduce:opacity-100 motion-reduce:py-6"
        >
          <div className="max-w-4xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#0F766E] mb-4">
              Why Trust Logistic
            </p>
            <WordFillText
              as="h2"
              text="Transport shouldn’t feel like a gamble."
              baseColor="#B3C1C3"
              wordAttr="data-hero-word"
              className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-extrabold tracking-tight leading-[1.1] sm:leading-[1.08]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
