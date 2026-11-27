import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildPageMetadata } from '@/lib/seo';
import { getPageConfig } from '@/lib/sitemap';
import { INDUSTRIES_CONTENT, getIndustryBySlug } from '@/content/industries';
import { IndustryDetailTemplate } from '@/components/public/templates/IndustryDetailTemplate';

export const dynamicParams = false;

export function generateStaticParams() {
  return INDUSTRIES_CONTENT.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);
  if (!industry) {
    return buildPageMetadata({ path: '/industries/', forceNoIndex: true });
  }
  const node = getPageConfig(industry.path);
  return buildPageMetadata({
    path: industry.path,
    title: industry.metaTitle,
    description: industry.metaDescription,
    keywords: industry.keywords,
    forceNoIndex: node?.status === 'draft',
  });
}

export default async function IndustryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);
  if (!industry) notFound();

  const node = getPageConfig(industry.path);
  const isDraft = node?.status === 'draft';

  return (
    <IndustryDetailTemplate
      industry={industry}
      isDraft={isDraft}
      draftPhase={node?.phase === 2 ? 2 : 3}
    />
  );
}
