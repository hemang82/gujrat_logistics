import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { DraftScaffoldTemplate } from '@/components/public/templates/DraftScaffoldTemplate';

export function generateMetadata(): Metadata {
  return buildPageMetadata({ path: '/sla/' });
}

export default function SlaPage() {
  return (
    <DraftScaffoldTemplate
      path="/sla/"
      phase={2}
      eyebrow="Service Availability"
      title="Service Level Agreement (SLA)"
      summary="Formal service availability and support response terms once SLA commitments are confirmed."
      requirement="Only publish SLA percentages or support response commitments if contractually offered."
    />
  );
}
