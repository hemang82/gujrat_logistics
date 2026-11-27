import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { DraftScaffoldTemplate } from '@/components/public/templates/DraftScaffoldTemplate';

export function generateMetadata(): Metadata {
  return buildPageMetadata({ path: '/resources/help-centre/' });
}

export default function HelpCentrePage() {
  return (
    <DraftScaffoldTemplate
      path="/resources/help-centre/"
      phase={3}
      eyebrow="Help & Updates"
      title="Help Centre / Knowledge Base"
      summary="Searchable operational documentation for Trust Logistic users."
      requirement="Confirm help centre ownership and documentation articles before publishing."
    />
  );
}
