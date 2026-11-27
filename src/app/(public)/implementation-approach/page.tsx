import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { DraftScaffoldTemplate } from '@/components/public/templates/DraftScaffoldTemplate';

export function generateMetadata(): Metadata {
  return buildPageMetadata({ path: '/implementation-approach/' });
}

export default function ImplementationApproachPage() {
  return (
    <DraftScaffoldTemplate
      path="/implementation-approach/"
      phase={2}
      eyebrow="Implementation"
      title="Implementation Approach & Onboarding"
      summary="Documented onboarding sequence for branch configuration, master setup, GSP credentials and staff walkthroughs."
      requirement="Confirm standard onboarding milestones and SLA timeline before publishing."
      cards={[
        {
          title: '01. Operational Audit & Branch Setup',
          detail: 'Configure head office, branches, LR numbering and user access controls.',
        },
        {
          title: '02. Party, Vehicle & Driver Masters',
          detail: 'Import recurring consignors, consignees, truck numbers and driver license logs.',
        },
        {
          title: '03. GSP & Dispatch Walkthrough',
          detail: 'Verify E-Way Bill connectivity and live LR, Challan and billing flows.',
        },
      ]}
    />
  );
}
