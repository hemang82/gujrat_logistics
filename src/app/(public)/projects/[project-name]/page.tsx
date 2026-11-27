import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { APPROVED_CASE_STUDIES } from '@/content/proof';
import { CaseStudyTemplate } from '@/components/public/templates/CaseStudyTemplate';

export function generateStaticParams() {
  if (APPROVED_CASE_STUDIES.length > 0) {
    return APPROVED_CASE_STUDIES.map((c) => ({ 'project-name': c.slug }));
  }
  return [{ 'project-name': 'sample-implementation' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ 'project-name': string }>;
}): Promise<Metadata> {
  const { 'project-name': slug } = await params;
  return buildPageMetadata({
    path: `/projects/${slug}/`,
    forceNoIndex: true,
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ 'project-name': string }>;
}) {
  const { 'project-name': slug } = await params;
  const item = APPROVED_CASE_STUDIES.find((c) => c.slug === slug);
  return <CaseStudyTemplate basePath="/projects/" slug={slug} item={item} />;
}
