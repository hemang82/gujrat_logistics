import Link from 'next/link';
import { ArrowRight, CheckCircle2, Info } from 'lucide-react';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { FaqSection } from '@/components/public/Faq';
import { PRICING_FAQS } from '@/content/faqs';

export function PricingTemplate() {
  const planStructures = [
    {
      name: 'Single-Branch / Desk Setup',
      audience: 'For individual booking offices, dispatch counters or commission brokers.',
      included: [
        'Digital LR / Bilty & Lorry Challans',
        'Crossing Memo & Lorry Hire records',
        'Paid, To-Pay & TBB client billing',
        'Daily booking & freight registers',
      ],
      limitation: 'Scoped to single branch operation; multi-branch sync available on upgrade.',
      highlighted: false,
    },
    {
      name: 'Multi-Branch Network',
      audience: 'For growing parcel and freight transporters operating multiple hubs.',
      included: [
        'All Single-Branch core modules',
        'Multi-branch logins & role-based permissions',
        'Inter-branch cash books & ledgers',
        'E-Way Bill & Consolidated EWB via GSP integration',
        'Fleet registry & driver advance ledgers',
      ],
      limitation: 'Configured by active branch count and enabled GSP E-Way Bill access.',
      highlighted: true,
    },
    {
      name: 'Fleet & Enterprise Operations',
      audience: 'For high-volume transport companies, fleet owners and custom deployments.',
      included: [
        'Full TMS suite across confirmed modules',
        'Owned & hired vehicle dispatch controls',
        'Consolidated party invoicing & operational reports',
        'Guided onboarding and data setup assistance',
      ],
      limitation: 'Custom scope confirmed directly after operational assessment.',
      highlighted: false,
    },
  ];

  return (
    <div className="bg-[#F3F7F7] pt-28 md:pt-36">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-14 md:pb-20">
        <Breadcrumbs path="/pricing/" />

        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14 space-y-4">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F766E]">
            Pricing &amp; Plans
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#06262A] tracking-tight">
            Plans that fit how your transport business runs
          </h1>
          <p className="text-base text-[#52666B] leading-relaxed">
            Every transport business is different, from a single-branch operator to a multi-branch company running FTL and PTL. Tell us which modules and setup you need and we will recommend the right plan. Pricing is shared after a short conversation, so you only pay for what your operations actually use.
          </p>
        </div>

        {/* Plans & Inclusions (No unconfirmed prices shown) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {planStructures.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between border ${
                plan.highlighted
                  ? 'bg-[#0A4F4A] text-white border-[#0A4F4A] shadow-2xl'
                  : 'bg-white text-[#06262A] border-[#0F766E]/15 shadow-sm'
              }`}
            >
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">{plan.name}</h2>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    plan.highlighted ? 'text-white/80' : 'text-[#52666B]'
                  }`}
                >
                  {plan.audience}
                </p>

                <div
                  className={`my-6 rounded-2xl p-4 border ${
                    plan.highlighted
                      ? 'bg-white/10 border-white/15'
                      : 'bg-[#F3F7F7] border-[#0F766E]/12'
                  }`}
                >
                  <p
                    className={`text-sm font-bold uppercase tracking-wider ${
                      plan.highlighted ? 'text-[#2DD4BF]' : 'text-[#0F766E]'
                    }`}
                  >
                    Pricing
                  </p>
                  <p className="mt-1 text-xl font-extrabold">
                    Contact us for pricing
                  </p>
                </div>

                <ul className="space-y-3">
                  {plan.included.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm sm:text-base">
                      <CheckCircle2
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          plan.highlighted ? 'text-[#2DD4BF]' : 'text-[#0F766E]'
                        }`}
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-current/15 space-y-5">
                <p
                  className={`text-sm flex items-start gap-2 ${
                    plan.highlighted ? 'text-white/80' : 'text-[#52666B]'
                  }`}
                >
                  <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{plan.limitation}</span>
                </p>

                <Link
                  href="/request-a-demo/"
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-full font-extrabold text-sm px-6 py-3.5 transition-transform hover:-translate-y-0.5 ${
                    plan.highlighted
                      ? 'bg-[#F59E0B] hover:bg-[#D97706] text-[#06262A]'
                      : 'bg-[#0F766E] hover:bg-[#0A4F4A] text-white'
                  }`}
                >
                  Request a Demo
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-white p-7 sm:p-9 border border-[#0F766E]/12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-extrabold text-[#06262A]">
              Prefer to discuss your setup over email or phone?
            </h2>
            <p className="mt-1 text-sm sm:text-base text-[#52666B]">
              Reach out to our team via Contact Us for sales enquiries before scheduling a live walkthrough.
            </p>
          </div>
          <Link
            href="/company/contact/"
            className="inline-flex items-center gap-2 rounded-full border border-[#0F766E] text-[#0F766E] hover:bg-[#0F766E] hover:text-white font-bold text-sm px-6 py-3 transition-colors shrink-0"
          >
            Contact Sales
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <FaqSection title="Pricing & Onboarding FAQs" items={PRICING_FAQS} />
    </div>
  );
}
