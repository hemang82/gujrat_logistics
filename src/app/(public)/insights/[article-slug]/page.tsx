import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildPageMetadata } from '@/lib/seo';
import { getAllInsights, getInsightBySlug } from '@/lib/insights';
import { InsightArticleTemplate } from '@/components/public/templates/InsightArticleTemplate';

export function generateStaticParams() {
  return getAllInsights().map((a) => ({ 'article-slug': a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ 'article-slug': string }>;
}): Promise<Metadata> {
  const { 'article-slug': slug } = await params;
  const article = getInsightBySlug(slug);
  if (!article) return buildPageMetadata({ path: '/insights/', forceNoIndex: true });

  return buildPageMetadata({
    path: `/insights/${slug}/`,
    title: `${article.frontmatter.title} | Trust Logistic`,
    description: article.frontmatter.description,
    ogType: 'article',
  });
}

export default async function InsightArticlePage({
  params,
}: {
  params: Promise<{ 'article-slug': string }>;
}) {
  const { 'article-slug': slug } = await params;
  const article = getInsightBySlug(slug);
  if (!article) notFound();

  return <InsightArticleTemplate article={article} />;
}
