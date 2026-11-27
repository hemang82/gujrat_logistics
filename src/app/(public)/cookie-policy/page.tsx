import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { DraftScaffoldTemplate } from '@/components/public/templates/DraftScaffoldTemplate';

export function generateMetadata(): Metadata {
  return buildPageMetadata({ path: '/cookie-policy/' });
}

export default function CookiePolicyPage() {
  return (
    <DraftScaffoldTemplate
      path="/cookie-policy/"
      phase={3}
      eyebrow="Legal & Compliance"
      title="Cookie Policy"
      summary="Cookie categories, analytics notice and session storage practices."
      requirement="Confirm legal review of analytics & authentication cookies before publishing live."
    />
  );
}
