'use client';

import dynamic from 'next/dynamic';
import { LenisProvider } from '@/components/public/LenisProvider';
import { Hero } from '@/components/public/Hero';
import { SolutionCards } from '@/components/public/SolutionCards';
import { FtlPtlSection } from '@/components/public/FtlPtlSection';
import { ProofSection } from '@/components/public/ProofSection';

// Code-split below-the-fold client interactive sections while keeping SSR HTML intact for SEO
const HowItWorks = dynamic(() =>
  import('@/components/public/HowItWorks').then((m) => m.HowItWorks)
);
const PlatformOverview = dynamic(() =>
  import('@/components/public/PlatformOverview').then((m) => m.PlatformOverview)
);
const IndustryCards = dynamic(() =>
  import('@/components/public/IndustryCards').then((m) => m.IndustryCards)
);
const PhotoBand = dynamic(() =>
  import('@/components/public/PhotoBand').then((m) => m.PhotoBand)
);
const PricingAndFaqSection = dynamic(() =>
  import('@/components/public/PricingAndFaqSection').then(
    (m) => m.PricingAndFaqSection
  )
);
const FinalScene = dynamic(() =>
  import('@/components/public/FinalScene').then((m) => m.FinalScene)
);

interface HomeClientProps {
  hasCustomTruckWebp: boolean;
}

export default function HomeClient({ hasCustomTruckWebp }: HomeClientProps) {
  return (
    <LenisProvider>
      {/* 1. Pinned Hero (Light) — 260vh desktop / 180vh mobile */}
      <Hero hasCustomTruckWebp={hasCustomTruckWebp} />

      {/* 2. Key Solutions (White) — 8 cards linking to /solutions/.../ */}
      <SolutionCards />

      {/* 3. FTL & PTL (Light) — Two large operational mode cards + CTA row */}
      <FtlPtlSection />

      {/* 4. How It Works (White) — Moving truck on scroll + 4 steps + CTA row */}
      <HowItWorks />

      {/* 5. Who We Are (Teal) — Main statement + 3 operational columns */}
      <PlatformOverview />

      {/* 6. Industries Served (Light) — 3 core business segment cards */}
      <IndustryCards />

      {/* 7. Merged Photo Band (White stage with Full-Bleed Photo Parallax + Floating Card) */}
      <PhotoBand />

      {/* 8. Proof (Conditional — Hidden in production until approved items exist) */}
      <ProofSection />

      {/* 9. Pricing Preview & FAQ Accordion (Light) — FAQPage JSON-LD + CTA row */}
      <PricingAndFaqSection />

      {/* 10. Final CTA + Demo Form (Dark Teal Container-Rise Scene) */}
      <FinalScene />
    </LenisProvider>
  );
}
