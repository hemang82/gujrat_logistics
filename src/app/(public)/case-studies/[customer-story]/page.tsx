import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { APPROVED_CASE_STUDIES } from '@/content/proof';
import { CaseStudyTemplate } from '@/components/public/templates/CaseStudyTemplate';

export function generateStaticParams() {
  if (APPROVED_CASE_STUDIES.length > 0) {
    return APPROVED_CASE_STUDIES.map((c) => ({ 'customer-story': c.slug }));
  }
  return [{ 'customer-story': 'sample-story' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ 'customer-story': string }>;
}): Promise<Metadata> {
  const { 'customer-story': slug } = await params;
  return buildPageMetadata({
    path: `/case-studies/${slug}/`,
    forceNoIndex: true,
  });
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ 'customer-story': string }>;
}) {
  const { 'customer-story': slug } = await params;
  const item = APPROVED_CASE_STUDIES.find((c) => c.slug === slug);
  return <CaseStudyTemplate basePath="/case-studies/" slug={slug} item={item} />;
}
