import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { DraftScaffoldTemplate } from '@/components/public/templates/DraftScaffoldTemplate';

export function generateMetadata(): Metadata {
  return buildPageMetadata({ path: '/resources/tutorials/' });
}

export default function TutorialsPage() {
  return (
    <DraftScaffoldTemplate
      path="/resources/tutorials/"
      phase={3}
      eyebrow="Guides & Learning"
      title="Software Guides & Tutorials"
      summary="Step-by-step product walkthroughs for booking counters, dispatch teams and branch accountants."
      requirement="Attach verified screenshots or tutorial videos before publishing live."
    />
  );
}
