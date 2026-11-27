import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo';
import { getAllInsights } from '@/lib/insights';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    path: '/insights/',
    title: 'Transport & Logistics Guides & Insights | Trust Logistic',
    description:
      'Practical guides on digital LR / Bilty, FTL & PTL dispatch, Consolidated E-Way Bills (CEWB), TBB freight billing and lorry hire settlements.',
    keywords: [
      'transport management guides India',
      'LR bilty blog',
      'E-Way Bill CEWB guide',
      'FTL PTL transport operations',
      'Trust Logistic insights',
    ],
  });
}

export default function InsightsPage() {
  const articles = getAllInsights();

  return (
    <div className="bg-[#F3F7F7] pt-28 md:pt-36">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-14 md:pb-20">
        <Breadcrumbs path="/insights/" />

        <div className="max-w-3xl space-y-4 mb-10 md:mb-14">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F766E]">
            Transport Insights &amp; Guides
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#06262A] tracking-tight">
            Practical guides for Indian road freight operations.
          </h1>
          <p className="text-base text-[#52666B] leading-relaxed">
            Operational playbooks covering digital LR / Bilty workflows, FTL and PTL dispatch, GSP E-Way Bill consolidation, branch cash books and lorry hire settlements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {articles.map((art) => (
            <Link
              key={art.slug}
              href={`/insights/${art.slug}/`}
              className="group rounded-3xl bg-white p-7 border border-[#0F766E]/12 shadow-sm hover:shadow-xl hover:border-[#0F766E]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F7F7] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0F766E]">
                    <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                    {art.frontmatter.category}
                  </span>
                  <span className="text-xs font-semibold text-[#52666B]">
                    {art.frontmatter.readingTime}
                  </span>
                </div>

                <h2 className="text-xl font-extrabold text-[#06262A] group-hover:text-[#0F766E] transition-colors leading-snug">
                  {art.frontmatter.title}
                </h2>
                <p className="mt-3 text-base text-[#52666B] leading-relaxed">
                  {art.frontmatter.description}
                </p>
              </div>

              <span className="mt-6 pt-4 border-t border-gray-100 inline-flex items-center gap-2 text-sm font-bold text-[#0F766E]">
                Read guide
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#0F766E] text-white py-20 px-4 sm:px-6 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            See these workflows live in Trust Logistic
          </h2>
          <Link
            href="/request-a-demo/"
            className="inline-flex items-center gap-2 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-[#06262A] font-extrabold text-base px-8 py-4 shadow-lg transition-transform hover:-translate-y-0.5"
          >
            Request a Demo
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
