import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { DraftScaffoldTemplate } from '@/components/public/templates/DraftScaffoldTemplate';

export function generateMetadata(): Metadata {
  return buildPageMetadata({ path: '/security-data-protection/' });
}

export default function SecurityDataProtectionPage() {
  return (
    <DraftScaffoldTemplate
      path="/security-data-protection/"
      phase={2}
      eyebrow="Trust & Security"
      title="Security & Data Protection"
      summary="Documentation covering access permissions, multi-branch isolation and backup practices."
      requirement="Confirm documented backup frequency, security controls and compliance statements before publishing."
      cards={[
        {
          title: 'Role-Based Branch Permissions',
          detail: 'Limit counter and branch staff strictly to assigned branch records.',
        },
        {
          title: 'Commercial Data Isolation',
          detail: 'Tenant-level separation of customer directories, freight rates and cash books.',
        },
      ]}
    />
  );
}
