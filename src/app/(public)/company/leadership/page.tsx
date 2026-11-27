import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { APPROVED_LEADERSHIP } from '@/content/proof';
import { DraftScaffoldTemplate } from '@/components/public/templates/DraftScaffoldTemplate';

export function generateMetadata(): Metadata {
  return buildPageMetadata({ path: '/company/leadership/' });
}

export default function LeadershipPage() {
  return (
    <DraftScaffoldTemplate
      path="/company/leadership/"
      phase={2}
      eyebrow="Leadership & Team"
      title="Leadership Team"
      summary="Directory of approved public-facing leaders at Trust Logistic."
      requirement="Add verified leader profiles in src/content/proof.ts before publishing."
      cards={
        APPROVED_LEADERSHIP.length > 0
          ? APPROVED_LEADERSHIP.map((l) => ({
              title: l.name,
              detail: `${l.role} — ${l.bio}`,
              href: `/company/leadership/${l.slug}/`,
            }))
          : [
              {
                title: '[Placeholder: Leadership Profile Slot]',
                detail: 'Individual leadership profile template is ready at /company/leadership/sample-leader/.',
                href: '/company/leadership/sample-leader/',
              },
            ]
      }
    />
  );
}
