import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { DraftBanner } from '@/components/public/DraftBanner';
import { FaqSection } from '@/components/public/Faq';
import { HOME_FAQS, PRICING_FAQS, SOLUTIONS_OVERVIEW_FAQS } from '@/content/faqs';

export function generateMetadata(): Metadata {
  return buildPageMetadata({ path: '/resources/faqs/' });
}

export default function ResourcesFaqsPage() {
  const combined = [...HOME_FAQS, ...SOLUTIONS_OVERVIEW_FAQS, ...PRICING_FAQS];

  return (
    <div className="bg-[#F3F7F7] pt-32 md:pt-36 pb-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs path="/resources/faqs/" />
        <DraftBanner
          phase={2}
          path="/resources/faqs/"
          requirement="Review combined FAQ answers and flip /resources/faqs/ status to live in /lib/sitemap.ts."
        />
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#06262A] tracking-tight mb-4">
          Frequently Asked Questions
        </h1>
      </div>
      <FaqSection
        title="Platform, Modules & Commercial FAQs"
        eyebrow="Knowledge Base"
        items={combined}
        className="pt-8"
      />
    </div>
  );
}
