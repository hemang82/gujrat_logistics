import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { APPROVED_CASE_STUDIES } from '@/content/proof';
import { DraftScaffoldTemplate } from '@/components/public/templates/DraftScaffoldTemplate';

export function generateMetadata(): Metadata {
  return buildPageMetadata({ path: '/projects/' });
}

export default function ProjectsPage() {
  return (
    <DraftScaffoldTemplate
      path="/projects/"
      phase={2}
      eyebrow="Projects & Success Stories"
      title="Customer Implementations & Verified Outcomes"
      summary="Verified transport software deployments, customer case studies, testimonials and our implementation methodology."
      requirement="Written client permissions and verified implementation stories in src/content/proof.ts."
      cards={[
        {
          title: 'Case Studies',
          detail: 'Customer challenges, rollout workflows and verified outcomes.',
          href: '/case-studies/',
        },
        {
          title: 'Testimonials',
          detail: 'Approved client testimonials from transporters, fleets and brokers.',
          href: '/testimonials/',
        },
        {
          title: 'Implementation Approach',
          detail: 'How Trust Logistic onboarded multi-branch offices and data.',
          href: '/implementation-approach/',
        },
        ...(APPROVED_CASE_STUDIES.length > 0
          ? APPROVED_CASE_STUDIES.map((cs) => ({
              title: cs.title,
              detail: cs.summary,
              href: `/projects/${cs.slug}/`,
            }))
          : [
              {
                title: '[Placeholder: Implementation Project]',
                detail: 'Detail template ready at /projects/sample-implementation/.',
                href: '/projects/sample-implementation/',
              },
            ]),
      ]}
    />
  );
}
