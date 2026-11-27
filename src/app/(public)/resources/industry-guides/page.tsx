import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { DraftScaffoldTemplate } from '@/components/public/templates/DraftScaffoldTemplate';

export function generateMetadata(): Metadata {
  return buildPageMetadata({ path: '/resources/industry-guides/' });
}

export default function IndustryGuidesPage() {
  return (
    <DraftScaffoldTemplate
      path="/resources/industry-guides/"
      phase={3}
      eyebrow="Guides & Learning"
      title="Transport Industry Guides"
      summary="Structured practical guides on freight documentation, LR compliance and multi-branch dispatch discipline."
      requirement="Complete editorial guides and flip /resources/industry-guides/ status to live."
    />
  );
}
