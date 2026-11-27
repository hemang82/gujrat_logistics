import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { APPROVED_CASE_STUDIES } from '@/content/proof';
import { DraftScaffoldTemplate } from '@/components/public/templates/DraftScaffoldTemplate';

export function generateMetadata(): Metadata {
  return buildPageMetadata({ path: '/case-studies/' });
}

export default function CaseStudiesPage() {
  return (
    <DraftScaffoldTemplate
      path="/case-studies/"
      phase={2}
      eyebrow="Case Studies"
      title="Approved Customer Case Studies"
      summary="Verified stories showing how Indian transporters run daily operations on Trust Logistic."
      requirement="Approve at least one client story in src/content/proof.ts before publishing."
      cards={
        APPROVED_CASE_STUDIES.length > 0
          ? APPROVED_CASE_STUDIES.map((cs) => ({
              title: cs.title,
              detail: cs.summary,
              href: `/case-studies/${cs.slug}/`,
            }))
          : [
              {
                title: '[Placeholder: Customer Story Template]',
                detail: 'Preview template at /case-studies/sample-story/.',
                href: '/case-studies/sample-story/',
              },
            ]
      }
    />
  );
}
