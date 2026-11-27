import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { DraftBanner } from '@/components/public/DraftBanner';
import { JsonLd } from '@/components/public/JsonLd';
import { buildArticleSchema } from '@/lib/seo';
import { type InsightArticle } from '@/lib/insights';

const mdxComponents = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      {...props}
      className="text-2xl sm:text-3xl font-extrabold text-[#06262A] tracking-tight mt-10 mb-4"
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      {...props}
      className="text-xl font-bold text-[#06262A] mt-7 mb-3"
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props} className="text-base text-[#52666B] leading-relaxed mb-5" />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className="list-disc pl-6 space-y-2 text-base text-[#52666B] mb-6" />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol {...props} className="list-decimal pl-6 space-y-2 text-base text-[#52666B] mb-6" />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      {...props}
      className="rounded-2xl border-l-4 border-[#F59E0B] bg-[#FFFBEB] px-5 py-4 text-sm text-[#06262A] font-medium my-6"
    />
  ),
};

export function InsightArticleTemplate({ article }: { article: InsightArticle }) {
  const path = `/insights/${article.slug}/`;

  return (
    <article className="bg-[#F3F7F7] pt-32 md:pt-36 pb-20">
      <JsonLd
        data={buildArticleSchema({
          title: article.frontmatter.title,
          description: article.frontmatter.description,
          path,
          publishedAt: article.frontmatter.publishedAt,
          updatedAt: article.frontmatter.updatedAt,
        })}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs path={path} currentLabel={article.frontmatter.title} />

        <DraftBanner
          phase={3}
          path={path}
          requirement="Final editorial sign-off for Phase 3 Insights before flipping /insights/ to live."
        />

        <div className="rounded-[2.25rem] bg-white p-8 sm:p-12 border border-[#0F766E]/12 shadow-sm">
          <header className="pb-8 border-b border-gray-100 space-y-4">
            <span className="inline-flex rounded-full bg-[#0F766E]/10 px-3.5 py-1 text-sm font-bold text-[#0F766E]">
              {article.frontmatter.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#06262A] tracking-tight leading-tight">
              {article.frontmatter.title}
            </h1>
            <p className="text-base text-[#52666B]">
              {article.frontmatter.description}
            </p>
            <div className="flex flex-wrap items-center gap-5 text-sm text-[#52666B] pt-1">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0F766E]" aria-hidden="true" />
                {article.frontmatter.publishedAt}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#0F766E]" aria-hidden="true" />
                {article.frontmatter.readingTime}
              </span>
            </div>
          </header>

          <div className="pt-8">
            <MDXRemote source={article.content} components={mdxComponents} />
          </div>

          <footer className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {article.frontmatter.relatedSolution && (
              <Link
                href={article.frontmatter.relatedSolution}
                className="text-sm font-bold text-[#0F766E] hover:underline"
              >
                Explore related product module →
              </Link>
            )}
            <Link
              href="/request-a-demo/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-[#06262A] font-extrabold text-sm px-6 py-3"
            >
              Request a Demo <ArrowRight className="w-4 h-4" />
            </Link>
          </footer>
        </div>
      </div>
    </article>
  );
}
