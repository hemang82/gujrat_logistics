import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { DraftBanner } from '@/components/public/DraftBanner';
import { type LaunchPhase } from '@/lib/sitemap';

interface DraftScaffoldProps {
  path: string;
  phase: LaunchPhase;
  eyebrow: string;
  title: string;
  summary: string;
  requirement: string;
  cards?: { title: string; detail: string; href?: string }[];
}

export function DraftScaffoldTemplate({
  path,
  phase,
  eyebrow,
  title,
  summary,
  requirement,
  cards = [],
}: DraftScaffoldProps) {
  return (
    <div className="bg-[#F3F7F7] pt-32 md:pt-36 pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs path={path} />
        <DraftBanner phase={phase} path={path} requirement={requirement} />

        <div className="rounded-[2.25rem] bg-white p-8 sm:p-12 border border-[#0F766E]/12 shadow-sm space-y-8">
          <div className="space-y-3 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F766E]">
              {eyebrow}
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#06262A] tracking-tight">
              {title}
            </h1>
            <p className="text-base sm:text-lg text-[#52666B] leading-relaxed">
              {summary}
            </p>
          </div>

          {cards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => {
                const body = (
                  <div className="h-full rounded-2xl bg-[#F3F7F7] p-6 border border-[#0F766E]/10 hover:border-[#0F766E]/40 transition-colors flex flex-col justify-between">
                    <div>
                      <h2 className="text-lg font-extrabold text-[#06262A]">{card.title}</h2>
                      <p className="mt-2 text-sm text-[#52666B] leading-relaxed">
                        {card.detail}
                      </p>
                    </div>
                    {card.href && (
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#0F766E]">
                        Open section <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                );
                return card.href ? (
                  <Link key={card.title} href={card.href}>
                    {body}
                  </Link>
                ) : (
                  <div key={card.title}>{body}</div>
                );
              })}
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <Link
              href="/request-a-demo/"
              className="inline-flex items-center gap-2 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-[#06262A] font-extrabold text-sm px-6 py-3"
            >
              Request a Demo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
