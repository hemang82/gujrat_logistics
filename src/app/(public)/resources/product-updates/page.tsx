import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { DraftScaffoldTemplate } from '@/components/public/templates/DraftScaffoldTemplate';

export function generateMetadata(): Metadata {
  return buildPageMetadata({ path: '/resources/product-updates/' });
}

export default function ProductUpdatesPage() {
  return (
    <DraftScaffoldTemplate
      path="/resources/product-updates/"
      phase={3}
      eyebrow="Help & Updates"
      title="Product News & Updates"
      summary="Release history and confirmed platform improvements."
      requirement="Only publish if maintained regularly with real release notes."
    />
  );
}
