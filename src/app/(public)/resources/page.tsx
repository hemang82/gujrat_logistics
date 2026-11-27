import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { DraftScaffoldTemplate } from '@/components/public/templates/DraftScaffoldTemplate';

export function generateMetadata(): Metadata {
  return buildPageMetadata({ path: '/resources/' });
}

export default function ResourcesHubPage() {
  return (
    <DraftScaffoldTemplate
      path="/resources/"
      phase={2}
      eyebrow="Resources Hub"
      title="Guides, Insights & Documentation"
      summary="Operational guides, FAQs and tutorials built to support Indian transport managers and dispatch teams."
      requirement="Approve initial guides, FAQs or MDX insights before switching /resources/ to live."
      cards={[
        {
          title: 'FAQs',
          detail: 'Answers covering confirmed modules, GSP E-Way Bill and branch workflows.',
          href: '/resources/faqs/',
        },
        {
          title: 'Insights / Blog (Phase 3)',
          detail: 'Operational articles rendered via MDX.',
          href: '/insights/',
        },
        {
          title: 'Industry Guides (Phase 3)',
          detail: 'Freight compliance, E-Way Bill & LR billing guides.',
          href: '/resources/industry-guides/',
        },
        {
          title: 'Software Tutorials (Phase 3)',
          detail: 'Step-by-step product guides for booking counters.',
          href: '/resources/tutorials/',
        },
      ]}
    />
  );
}
