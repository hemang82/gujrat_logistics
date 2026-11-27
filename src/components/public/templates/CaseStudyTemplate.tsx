import Link from 'next/link';
import { ArrowRight, CheckCircle2, Quote } from 'lucide-react';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { AssetSlotView } from '@/components/public/AssetSlot';
import { DraftBanner } from '@/components/public/DraftBanner';
import { ASSETS } from '@/lib/assets';
import { type ApprovedCaseStudy } from '@/content/proof';

interface CaseStudyTemplateProps {
  basePath: '/projects/' | '/case-studies/';
  slug: string;
  item?: ApprovedCaseStudy;
}

export function CaseStudyTemplate({ basePath, slug, item }: CaseStudyTemplateProps) {
  const path = `${basePath}${slug}/`;

  return (
    <div className="bg-[#F3F7F7] pt-32 md:pt-36 pb-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        <Breadcrumbs
          path={path}
          currentLabel={item?.title || 'Draft Story Scaffold'}
        />
        <DraftBanner
          phase={2}
          path={path}
          requirement="Customer written approval, verified metrics, real client context and quote."
        />

        <div className="rounded-[2.25rem] bg-white p-8 sm:p-12 border border-[#0F766E]/12 shadow-sm space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-bold uppercase tracking-wider text-[#0F766E]">
              {item ? `${item.segment} · ${item.location}` : '[Placeholder: Segment & Location]'}
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#06262A] tracking-tight">
              {item?.title || '[Placeholder: Approved Customer Story Title]'}
            </h1>
            <p className="text-base sm:text-lg text-[#52666B] leading-relaxed">
              {item?.summary ||
                '[Placeholder: Factual overview of approved customer implementation and verified workflow outcomes.]'}
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-[#0F766E]/15">
            <AssetSlotView asset={ASSETS.caseStudies.placeholderCover} darkSurface={false} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-[#F3F7F7] p-6">
              <h2 className="text-lg font-extrabold text-[#06262A]">Customer Context</h2>
              <p className="mt-2 text-sm sm:text-base text-[#52666B] leading-relaxed">
                {item?.context || '[Placeholder: Branch count, operational profile and dispatch volume.]'}
              </p>
            </div>
            <div className="rounded-2xl bg-[#F3F7F7] p-6">
              <h2 className="text-lg font-extrabold text-[#06262A]">Challenge</h2>
              <p className="mt-2 text-sm sm:text-base text-[#52666B] leading-relaxed">
                {item?.challenge || '[Placeholder: Specific operational challenge prior to Trust Logistic.]'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-extrabold text-[#06262A]">Implementation &amp; Outcomes</h2>
            <p className="text-base text-[#52666B] leading-relaxed">
              {item?.implementation ||
                '[Placeholder: Confirmed rollout process across booking, E-Way Bill and branch accounts.]'}
            </p>
            <ul className="space-y-2.5 pt-2">
              {(item?.verifiedOutcomes.length
                ? item.verifiedOutcomes
                : ['[Placeholder: Add verified customer outcome only with written sign-off]']
              ).map((outcome, i) => (
                <li key={i} className="flex items-start gap-2.5 text-base font-medium text-[#06262A]">
                  <CheckCircle2 className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>

          {item?.quote && (
            <blockquote className="rounded-2xl bg-[#0A4F4A] text-white p-7">
              <Quote className="w-6 h-6 text-[#2DD4BF] mb-3" aria-hidden="true" />
              <p className="text-lg font-medium leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
              <footer className="mt-3 text-sm text-[#2DD4BF] font-bold">
                — {item.clientName}
              </footer>
            </blockquote>
          )}

          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <Link
              href={
                item?.relatedSolutionSlug
                  ? `/solutions/${item.relatedSolutionSlug}/`
                  : '/solutions/transport-management-software/'
              }
              className="text-sm font-bold text-[#0F766E] hover:underline"
            >
              Explore related solution →
            </Link>

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
