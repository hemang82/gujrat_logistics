import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildPageMetadata } from '@/lib/seo';
import { getPageConfig } from '@/lib/sitemap';
import { SOLUTIONS_CONTENT, getSolutionBySlug } from '@/content/solutions';
import { SolutionDetailTemplate } from '@/components/public/templates/SolutionDetailTemplate';

export const dynamicParams = false;

export function generateStaticParams() {
  return SOLUTIONS_CONTENT.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sol = getSolutionBySlug(slug);
  if (!sol) {
    return buildPageMetadata({ path: '/solutions/', forceNoIndex: true });
  }
  const node = getPageConfig(sol.path);
  return buildPageMetadata({
    path: sol.path,
    title: sol.metaTitle,
    description: sol.metaDescription,
    keywords: sol.keywords,
    forceNoIndex: node?.status === 'draft',
  });
}

export default async function SolutionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const solution = getSolutionBySlug(slug);
  if (!solution) notFound();

  const node = getPageConfig(solution.path);
  const isDraft = node?.status === 'draft';

  return (
    <SolutionDetailTemplate
      solution={solution}
      isDraft={isDraft}
      draftPhase={node?.phase === 2 ? 2 : 3}
    />
  );
}
