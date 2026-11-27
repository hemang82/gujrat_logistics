import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { DraftScaffoldTemplate } from '@/components/public/templates/DraftScaffoldTemplate';

export function generateMetadata(): Metadata {
  return buildPageMetadata({ path: '/company/' });
}

export default function CompanyHubPage() {
  return (
    <DraftScaffoldTemplate
      path="/company/"
      phase={2}
      eyebrow="Company Hub"
      title="Trust Logistic Corporate Overview"
      summary="Central corporate directory linking About Us, approved leadership profiles, careers and contact channels."
      requirement="Confirm leadership profiles and hiring status before publishing this hub live."
      cards={[
        {
          title: 'About Us',
          detail: 'Our product vision, story and transport software principles.',
          href: '/company/about-us/',
        },
        {
          title: 'Leadership Team',
          detail: 'Draft Phase 2 section awaiting approved executive profiles.',
          href: '/company/leadership/',
        },
        {
          title: 'Careers',
          detail: 'Draft Phase 2 section awaiting active job openings.',
          href: '/company/careers/',
        },
        {
          title: 'Contact & Support',
          detail: 'Sales enquiries, customer support and business contact channels.',
          href: '/company/contact/',
        },
      ]}
    />
  );
}
