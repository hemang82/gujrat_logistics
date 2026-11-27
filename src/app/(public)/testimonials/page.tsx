import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { APPROVED_TESTIMONIALS } from '@/content/proof';
import { DraftScaffoldTemplate } from '@/components/public/templates/DraftScaffoldTemplate';

export function generateMetadata(): Metadata {
  return buildPageMetadata({ path: '/testimonials/' });
}

export default function TestimonialsPage() {
  return (
    <DraftScaffoldTemplate
      path="/testimonials/"
      phase={2}
      eyebrow="Client Feedback"
      title="Client Testimonials"
      summary="Verified quotes from transport companies, fleet owners and brokers using Trust Logistic."
      requirement="Client quotes, names and permissions in src/content/proof.ts before publishing."
      cards={
        APPROVED_TESTIMONIALS.length > 0
          ? APPROVED_TESTIMONIALS.map((t) => ({
              title: `${t.personName} — ${t.companyName}`,
              detail: `"${t.quote}"`,
            }))
          : [
              {
                title: '[Placeholder: Approved Client Quote Slot]',
                detail: 'Never invent testimonials. Add verified quotes with client permission.',
              },
            ]
      }
    />
  );
}
