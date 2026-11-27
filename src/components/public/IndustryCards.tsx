import Link from 'next/link';
import { ArrowRight, Building2, Truck, Handshake } from 'lucide-react';
import { INDUSTRIES_CONTENT } from '@/content/industries';
import { SectionHeader } from './SectionHeader';

const INDUSTRY_ICONS: Record<string, typeof Truck> = {
  'transport-companies': Building2,
  'fleet-owners': Truck,
  'transport-brokers': Handshake,
};

const CORE_INDUSTRY_SLUGS = ['transport-companies', 'fleet-owners', 'transport-brokers'];

export function IndustryCards() {
  const industries = INDUSTRIES_CONTENT.filter(
    (i) => i.status === 'live' && CORE_INDUSTRY_SLUGS.includes(i.slug)
  );

  return (
    <section
      aria-labelledby="industries-served-heading"
      className="bg-[#F3F7F7] py-14 md:py-24 border-t border-[#0F766E]/10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          headingId="industries-served-heading"
          eyebrow="Industries Served"
          title="Built around how Indian road freight operates."
          subtitle="Structured around transport companies, fleet owners and transport brokers."
          action={
            <Link
              href="/industries/"
              className="inline-flex items-center gap-2 rounded-full border border-[#0F766E]/25 bg-white px-5 py-2.5 text-sm font-bold text-[#0F766E] hover:bg-[#0F766E] hover:text-white transition-colors w-fit"
            >
              All Industries
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          }
        />

        {/* 3 Cards per Row on Desktop, 1 per Row on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
          {industries.map((industry) => {
            const Icon = INDUSTRY_ICONS[industry.slug] || Truck;
            const summary = industry.cardSummary || industry.summary;
            const bullets = (
              industry.cardHighlights || industry.workflows.map((wf) => wf.title)
            )
              .slice(0, 3)
              .map((item) => item.replace(/^\d+\.\s*/, ''));

            return (
              <Link
                key={industry.slug}
                href={industry.path}
                className="group rounded-3xl bg-white hover:bg-[#0A4F4A] p-6 sm:p-7 border border-[#0F766E]/12 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#F3F7F7] text-[#0F766E] group-hover:bg-[#2DD4BF] group-hover:text-[#06262A] flex items-center justify-center transition-colors shrink-0">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#06262A] group-hover:text-white transition-colors leading-snug">
                      {industry.shortName}
                    </h3>
                  </div>
                  <p className="text-base text-[#52666B] group-hover:text-white/90 leading-relaxed transition-colors">
                    {summary}
                  </p>
                  <ul className="mt-5 space-y-2.5 border-t border-[#0F766E]/12 group-hover:border-white/15 pt-4">
                    {bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="text-sm sm:text-base font-medium text-[#06262A] group-hover:text-white transition-colors flex items-start gap-2.5 leading-snug"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] group-hover:bg-[#2DD4BF] shrink-0 mt-2" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <span className="mt-6 pt-2 inline-flex items-center gap-2 text-sm font-bold text-[#0F766E] group-hover:text-[#F59E0B] transition-colors">
                  Explore {industry.shortName}
                  <ArrowRight
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
