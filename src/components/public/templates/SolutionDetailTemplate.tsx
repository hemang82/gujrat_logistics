import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { AssetSlotView } from '@/components/public/AssetSlot';
import { FaqSection } from '@/components/public/Faq';
import { JsonLd } from '@/components/public/JsonLd';
import { DraftBanner } from '@/components/public/DraftBanner';
import { ASSETS } from '@/lib/assets';
import { buildSoftwareApplicationSchema } from '@/lib/seo';
import { SOLUTIONS_CONTENT, type SolutionContent } from '@/content/solutions';
import { INDUSTRIES_CONTENT } from '@/content/industries';

interface SolutionDetailTemplateProps {
  solution: SolutionContent;
  isDraft?: boolean;
  draftPhase?: 2 | 3;
}

export function SolutionDetailTemplate({
  solution,
  isDraft = false,
  draftPhase = 3,
}: SolutionDetailTemplateProps) {
  const screenshotAsset =
    (ASSETS.solutions as Record<string, (typeof ASSETS.solutions)['transport-management-software']>)[
      solution.slug
    ] || ASSETS.solutions['transport-management-software'];

  const relatedSolutionObjs = SOLUTIONS_CONTENT.filter(
    (s) => solution.relatedSolutions.includes(s.path) && s.status === 'live'
  );
  const relatedIndustryObjs = INDUSTRIES_CONTENT.filter(
    (i) => solution.relatedIndustries.includes(i.path) && i.status === 'live'
  );

  return (
    <div className="bg-[#F3F7F7] pt-28 md:pt-36">
      <JsonLd
        data={buildSoftwareApplicationSchema({
          name: `Trust Logistic — ${solution.shortName}`,
          description: solution.summary,
          path: solution.path,
          featureList: solution.featureDetails.map((f) => f.title),
        })}
      />

      {/* Hero Header */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
        <Breadcrumbs path={solution.path} currentLabel={solution.shortName} />

        {isDraft && (
          <DraftBanner
            phase={draftPhase}
            path={solution.path}
            requirement="Confirm module scope, real product screenshots and documentation before switching status to live."
          />
        )}

        <div className="rounded-[1.75rem] sm:rounded-[2.25rem] bg-white p-6 sm:p-12 md:p-14 border border-[#0F766E]/12 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F766E]">
            {solution.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#06262A] tracking-tight leading-[1.1] max-w-4xl">
            {solution.h1}
          </h1>
          <p className="mt-5 text-base text-[#52666B] leading-relaxed max-w-3xl">
            {solution.summary}
          </p>
          <div className="mt-8">
            <Link
              href="/request-a-demo/"
              className="inline-flex items-center gap-2 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-[#06262A] font-extrabold text-base px-7 py-3.5 shadow-md transition-transform hover:-translate-y-0.5"
            >
              Request a Demo
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* 1. Problem */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-3xl bg-[#0A4F4A] text-white p-8 sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#2DD4BF] mb-3">
            The Operational Problem
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-8">
            {solution.problemTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {solution.problemPoints.map((pt, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/8 border border-white/15 p-6 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-base text-white/90 leading-relaxed">{pt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Connected Workflow */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F766E] mb-2">
            Workflow
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#06262A] tracking-tight">
            {solution.workflowTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {solution.workflowSteps.map((st) => (
            <div
              key={st.step}
              className="rounded-3xl bg-white p-7 border border-[#0F766E]/12 shadow-sm"
            >
              <span className="inline-flex rounded-full bg-[#0F766E] text-white text-sm font-bold px-3 py-1 mb-4">
                Step {st.step}
              </span>
              <h3 className="text-lg font-extrabold text-[#06262A]">{st.title}</h3>
              <p className="mt-2.5 text-sm text-[#52666B] leading-relaxed">
                {st.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Feature Details & Practical Benefits + 4. Real Screenshot Slot */}
      <section className="bg-white py-20 border-y border-[#0F766E]/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F766E] mb-3">
              Feature Details
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#06262A] tracking-tight mb-8">
              What is included in {solution.shortName}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {solution.featureDetails.map((feat) => (
                <div
                  key={feat.title}
                  className="rounded-2xl bg-[#F3F7F7] p-6 border border-[#0F766E]/10"
                >
                  <h3 className="text-lg font-extrabold text-[#06262A]">{feat.title}</h3>
                  <p className="mt-2 text-base text-[#52666B] leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Screenshot Slot + Practical Benefits */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 overflow-hidden rounded-3xl border border-[#0F766E]/15 shadow-lg">
              <AssetSlotView
                asset={screenshotAsset}
                sizes="(max-width: 1024px) 100vw, 720px"
                darkSurface={false}
              />
            </div>

            <div className="lg:col-span-5 space-y-5">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F766E]">
                Practical Benefits
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#06262A] tracking-tight">
                Everyday operational impact
              </h2>
              <ul className="space-y-3.5">
                {solution.practicalBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-base text-[#06262A]">
                    <CheckCircle2
                      className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Related Solutions & Industries Internal Linking */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-3xl bg-white p-7 border border-[#0F766E]/12">
            <h2 className="text-xl font-extrabold text-[#06262A] mb-4">
              Related Solutions
            </h2>
            <ul className="space-y-3">
              {relatedSolutionObjs.map((rel) => (
                <li key={rel.path}>
                  <Link
                    href={rel.path}
                    className="group flex items-center justify-between rounded-xl bg-[#F3F7F7] px-4 py-3 text-sm font-bold text-[#06262A] hover:bg-[#0F766E] hover:text-white transition-colors"
                  >
                    <span>{rel.shortName}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-white p-7 border border-[#0F766E]/12">
            <h2 className="text-xl font-extrabold text-[#06262A] mb-4">
              Relevant Industries
            </h2>
            <ul className="space-y-3">
              {relatedIndustryObjs.map((ind) => (
                <li key={ind.path}>
                  <Link
                    href={ind.path}
                    className="group flex items-center justify-between rounded-xl bg-[#F3F7F7] px-4 py-3 text-sm font-bold text-[#06262A] hover:bg-[#0F766E] hover:text-white transition-colors"
                  >
                    <span>{ind.shortName}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <FaqSection
        title={`${solution.shortName} FAQs`}
        items={solution.faqs}
      />

      {/* Single Primary Commercial CTA */}
      <section className="bg-[#0F766E] text-white py-20 px-4 sm:px-6 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            See {solution.shortName} in a live demo
          </h2>
          <p className="text-base text-white/85">
            Walk through real screens and sample bookings with our implementation team.
          </p>
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
