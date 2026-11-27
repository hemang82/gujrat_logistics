import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { FaqSection } from '@/components/public/Faq';
import { DraftBanner } from '@/components/public/DraftBanner';
import { SOLUTIONS_CONTENT } from '@/content/solutions';
import { type IndustryContent } from '@/content/industries';

interface IndustryDetailTemplateProps {
  industry: IndustryContent;
  isDraft?: boolean;
  draftPhase?: 2 | 3;
}

export function IndustryDetailTemplate({
  industry,
  isDraft = false,
  draftPhase = 3,
}: IndustryDetailTemplateProps) {
  const relatedSolutions = SOLUTIONS_CONTENT.filter(
    (s) => industry.relatedSolutions.includes(s.path) && s.status === 'live'
  );

  return (
    <div className="bg-[#F3F7F7] pt-28 md:pt-36">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
        <Breadcrumbs path={industry.path} currentLabel={industry.shortName} />

        {isDraft && (
          <DraftBanner
            phase={draftPhase}
            path={industry.path}
            requirement="Validate segment workflow depth and approved customer use cases before publishing live."
          />
        )}

        <div className="rounded-[1.75rem] sm:rounded-[2.25rem] bg-white p-6 sm:p-12 md:p-14 border border-[#0F766E]/12 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F766E]">
            {industry.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#06262A] tracking-tight leading-[1.1] max-w-4xl">
            {industry.h1}
          </h1>
          <p className="mt-5 text-base text-[#52666B] leading-relaxed max-w-3xl">
            {industry.summary}
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

      {/* Industry Challenges */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-3xl bg-[#0A4F4A] text-white p-8 sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#2DD4BF] mb-3">
            Industry Challenges
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-8">
            {industry.challengesTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {industry.challenges.map((ch) => (
              <div
                key={ch.title}
                className="rounded-2xl bg-white/8 border border-white/15 p-6 space-y-2.5"
              >
                <div className="flex items-center gap-2 text-[#F59E0B] font-bold text-base">
                  <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <h3>{ch.title}</h3>
                </div>
                <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                  {ch.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Relevant Workflows & How Platform Fits */}
      <section className="bg-white py-20 border-y border-[#0F766E]/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-6 space-y-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F766E]">
              Relevant Workflows
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#06262A] tracking-tight">
              Daily tasks handled inside Trust Logistic
            </h2>
            <div className="space-y-4">
              {industry.workflows.map((wf) => (
                <div
                  key={wf.title}
                  className="rounded-2xl bg-[#F3F7F7] p-6 border border-[#0F766E]/10"
                >
                  <h3 className="text-lg font-extrabold text-[#06262A]">{wf.title}</h3>
                  <p className="mt-2 text-base text-[#52666B] leading-relaxed">
                    {wf.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F766E]">
                How The Platform Fits
              </p>
              <h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-[#06262A] tracking-tight">
                {industry.platformFitTitle}
              </h2>
              <ul className="mt-5 space-y-3.5">
                {industry.platformFitPoints.map((pt) => (
                  <li key={pt} className="flex items-start gap-3 text-base text-[#06262A]">
                    <CheckCircle2
                      className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Typical Operational Scenario (Factual workflow illustration, no invented client) */}
            <div className="rounded-3xl bg-[#F3F7F7] border border-[#0F766E]/15 p-7">
              <p className="text-sm font-bold uppercase tracking-wider text-[#0F766E]">
                Operational Use Case
              </p>
              <h3 className="mt-1.5 text-xl font-extrabold text-[#06262A]">
                {industry.operationalScenario.title}
              </h3>
              <p className="mt-3 text-base text-[#52666B] leading-relaxed">
                {industry.operationalScenario.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {industry.operationalScenario.modulesUsed.map((mod) => (
                  <span
                    key={mod}
                    className="rounded-full bg-white border border-[#0F766E]/20 px-3 py-1 text-sm font-semibold text-[#0F766E]"
                  >
                    {mod}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Linked Solutions */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-6">
        <h2 className="text-2xl font-extrabold text-[#06262A] mb-6">
          Recommended Modules for {industry.shortName}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {relatedSolutions.map((sol) => (
            <Link
              key={sol.path}
              href={sol.path}
              className="group rounded-2xl bg-white p-5 border border-[#0F766E]/12 hover:border-[#0F766E] transition-colors flex flex-col justify-between"
            >
              <span className="text-base font-extrabold text-[#06262A] group-hover:text-[#0F766E]">
                {sol.shortName}
              </span>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#0F766E]">
                Open module <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <FaqSection title={`${industry.shortName} FAQs`} items={industry.faqs} />

      <section className="bg-[#0F766E] text-white py-20 px-4 sm:px-6 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Walk through {industry.shortName} workflows with our team
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
