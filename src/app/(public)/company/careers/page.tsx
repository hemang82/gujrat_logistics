import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { ACTIVE_CAREER_OPENINGS } from '@/content/proof';
import { DraftScaffoldTemplate } from '@/components/public/templates/DraftScaffoldTemplate';

export function generateMetadata(): Metadata {
  return buildPageMetadata({ path: '/company/careers/' });
}

export default function CareersPage() {
  return (
    <DraftScaffoldTemplate
      path="/company/careers/"
      phase={2}
      eyebrow="Careers"
      title="Careers at Trust Logistic"
      summary="Active openings and workplace overview once hiring roles are confirmed."
      requirement="Confirm whether Trust Logistic is actively hiring and add roles in src/content/proof.ts."
      cards={
        ACTIVE_CAREER_OPENINGS.length > 0
          ? ACTIVE_CAREER_OPENINGS.map((job) => ({
              title: job.title,
              detail: `${job.department} · ${job.location}`,
              href: `/company/careers/${job.slug}/`,
            }))
          : [
              {
                title: '[Placeholder: Active Role Scaffold]',
                detail: 'Job detail template scaffolded at /company/careers/sample-role/.',
                href: '/company/careers/sample-role/',
              },
            ]
      }
    />
  );
}
