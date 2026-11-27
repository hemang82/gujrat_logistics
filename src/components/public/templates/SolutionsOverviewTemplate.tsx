import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { FaqSection } from '@/components/public/Faq';
import { getLiveSolutions } from '@/content/solutions';
import { getLiveIndustries } from '@/content/industries';
import { SOLUTIONS_OVERVIEW_FAQS } from '@/content/faqs';

export function SolutionsOverviewTemplate() {
  const solutions = getLiveSolutions();
  const industries = getLiveIndustries();

  const coreBookingGroup = solutions.filter((s) =>
    [
      'transport-management-software',
      'lr-bilty-management',
      'e-way-bill-management',
      'transport-billing-invoicing',
    ].includes(s.slug)
  );

  const operationsAccountsGroup = solutions.filter((s) =>
    [
      'transport-accounting',
      'fleet-management',
      'driver-management',
      'reports-analytics',
    ].includes(s.slug)
  );

  return (
    <div className="bg-[#F3F7F7] pt-28 md:pt-36">
      {/* Platform Summary */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
        <Breadcrumbs path="/solutions/" />
        <div className="rounded-[1.75rem] sm:rounded-[2.25rem] bg-white p-6 sm:p-12 md:p-14 border border-[#0F766E]/12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-8 space-y-5">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F766E]">
              Platform Solutions
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#06262A] tracking-tight leading-[1.1]">
              One connected system for every desk in your transport business.
            </h1>
            <p className="text-base text-[#52666B] leading-relaxed max-w-2xl">
              Trust Logistic replaces disconnected bilty pads, dispatch notebooks and manual spreadsheets with confirmed modules engineered specifically for Indian transport operations.
            </p>
            <div className="pt-2">
              <Link
                href="/request-a-demo/"
                className="inline-flex items-center gap-2 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-[#06262A] font-extrabold text-base px-7 py-3.5 shadow-md transition-transform hover:-translate-y-0.5"
              >
                Request a Demo
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 rounded-3xl bg-[#0A4F4A] text-white p-7 space-y-4">
            <p className="text-sm font-bold uppercase tracking-wider text-[#2DD4BF]">
              Confirmed Capabilities
            </p>
            <ul className="space-y-3 text-sm font-medium text-white/90">
              {[
                'LR / Bilty, Lorry Challan, Crossing Memo & Lorry Hire',
                'Delivery status tracking & public LR lookup',
                'Fleet registry & Driver advance ledgers',
                'Branch cash books, accounting & freight billing',
                'Direct E-Way Bill generation via GSP integration',
                'Operational registers & invoice reports',
              ].map((cap) => (
                <li key={cap} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Capability Group 1 */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-14">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#06262A] tracking-tight mb-8">
          Booking, Dispatch &amp; Compliance Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coreBookingGroup.map((sol) => (
            <Link
              key={sol.slug}
              href={sol.path}
              className="group rounded-3xl bg-white p-8 border border-[#0F766E]/12 hover:border-[#0F766E]/40 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-[#0F766E]">
                  {sol.eyebrow}
                </p>
                <h3 className="mt-2 text-2xl font-extrabold text-[#06262A] group-hover:text-[#0F766E] transition-colors">
                  {sol.shortName}
                </h3>
                <p className="mt-3 text-base text-[#52666B] leading-relaxed">
                  {sol.summary}
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#0F766E]">
                View {sol.shortName}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Capability Group 2 */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#06262A] tracking-tight mb-8">
          Fleet, Driver, Accounting &amp; Reporting Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {operationsAccountsGroup.map((sol) => (
            <Link
              key={sol.slug}
              href={sol.path}
              className="group rounded-3xl bg-white p-8 border border-[#0F766E]/12 hover:border-[#0F766E]/40 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-[#0F766E]">
                  {sol.eyebrow}
                </p>
                <h3 className="mt-2 text-2xl font-extrabold text-[#06262A] group-hover:text-[#0F766E] transition-colors">
                  {sol.shortName}
                </h3>
                <p className="mt-3 text-base text-[#52666B] leading-relaxed">
                  {sol.summary}
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#0F766E]">
                View {sol.shortName}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Benefits & Use Cases */}
      <section className="bg-white py-20 border-y border-[#0F766E]/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-6 space-y-5">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F766E]">
                Platform Benefits
              </p>
              <h2 className="text-3xl font-extrabold text-[#06262A] tracking-tight">
                Enter consignment data once. Use it across every department.
              </h2>
              <ul className="space-y-4 pt-2">
                {[
                  'Stop re-typing LRs into challans, E-Way Bill portals and client invoices.',
                  'Eliminate Paid / To-Pay cash confusion across regional branches.',
                  'Track both owned commercial vehicles and market-hired lorries side by side.',
                  'Export audit-ready operational registers and invoice reports cleanly.',
                ].map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-base text-[#06262A]">
                    <CheckCircle2 className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-6 space-y-5">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F766E]">
                Relevant Use Cases
              </p>
              <h2 className="text-3xl font-extrabold text-[#06262A] tracking-tight">
                How different operators use Trust Logistic
              </h2>
              <div className="space-y-3 pt-2">
                {industries.map((ind) => (
                  <Link
                    key={ind.slug}
                    href={ind.path}
                    className="group block rounded-2xl bg-[#F3F7F7] p-5 border border-[#0F766E]/10 hover:border-[#0F766E] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-[#06262A] group-hover:text-[#0F766E]">
                        {ind.shortName}
                      </h3>
                      <ArrowRight className="w-4 h-4 text-[#0F766E]" aria-hidden="true" />
                    </div>
                    <p className="mt-1.5 text-sm text-[#52666B]">
                      {ind.summary}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <FaqSection
        title="Solutions FAQs"
        items={SOLUTIONS_OVERVIEW_FAQS}
      />

      {/* Single Primary Commercial CTA */}
      <section className="bg-[#0F766E] text-white py-20 px-4 sm:px-6 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            See every module running live on a demo walkthrough.
          </h2>
          <p className="text-base text-white/85">
            Schedule a guided product tour tailored to your branch setup and fleet workflow.
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
