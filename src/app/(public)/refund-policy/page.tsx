import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { DraftScaffoldTemplate } from '@/components/public/templates/DraftScaffoldTemplate';

export function generateMetadata(): Metadata {
  return buildPageMetadata({ path: '/refund-policy/' });
}

export default function RefundPolicyPage() {
  return (
    <DraftScaffoldTemplate
      path="/refund-policy/"
      phase={3}
      eyebrow="Legal & Compliance"
      title="Refund & Cancellation Policy"
      summary="Subscription cancellation terms and commercial refund eligibility."
      requirement="Confirm commercial pricing and refund rules before publishing live."
    />
  );
}
