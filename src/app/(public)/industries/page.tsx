import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, Truck, Handshake, Route, Boxes } from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { getLiveIndustries } from '@/content/industries';

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    path: '/industries/',
    title: 'Logistics & Transport Software by Industry | Trust Logistic',
    description:
      'Explore Trust Logistic software built for Indian transport companies, fleet owners, brokers, FTL, and PTL transporters. Manage LR, E-Way Bills & freight billing.',
    keywords: [
      'transport management software India',
      'logistics software by industry',
      'FTL PTL transport software',
      'fleet owner software',
      'transport broker software',
      'Trust Logistic',
    ],
  });
}

const ICONS: Record<string, typeof Truck> = {
  'transport-companies': Building2,
  'fleet-owners': Truck,
  'transport-brokers': Handshake,
  'ftl-transporters': Route,
  'ptl-transporters': Boxes,
};

export default function IndustriesOverviewPage() {
  const industries = getLiveIndustries();

  return (
    <div className="bg-[#F3F7F7] pt-28 md:pt-36">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-14 md:pb-20">
        <Breadcrumbs path="/industries/" />

        <div className="max-w-3xl space-y-4 mb-10 md:mb-14">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F766E]">
            Industries We Serve
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#06262A] tracking-tight">
            Transport Management Software Tailored to Your Business Model
          </h1>
          <p className="text-base text-[#52666B] leading-relaxed">
            Whether you run a multi-branch transport company, own a fleet of trucks, work as a commission broker, or specialise in FTL or PTL cargo—Trust Logistic adapts to your exact daily workflows from booking and LR creation to POD and freight billing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {industries.map((ind) => {
            const Icon = ICONS[ind.slug] || Truck;
            const title = ind.cardTitle || ind.shortName;
            const summary = ind.cardSummary || ind.summary;
            const bullets = ind.cardHighlights || ind.workflows.map((wf) => wf.title);

            return (
              <Link
                key={ind.slug}
                href={ind.path}
                className="group rounded-3xl bg-white p-8 border border-[#0F766E]/12 shadow-sm hover:shadow-xl hover:border-[#0F766E]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#F3F7F7] text-[#0F766E] group-hover:bg-[#0F766E] group-hover:text-white flex items-center justify-center transition-colors mb-6">
                    <Icon className="w-7 h-7" aria-hidden="true" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#06262A] group-hover:text-[#0F766E] transition-colors">
                    {title}
                  </h2>
                  <p className="mt-3 text-base text-[#52666B] leading-relaxed">
                    {summary}
                  </p>
                  <ul className="mt-6 space-y-2 border-t border-gray-100 pt-5 text-sm font-semibold text-[#06262A]">
                    {bullets.map((pt) => (
                      <li key={pt}>• {pt}</li>
                    ))}
                  </ul>
                </div>

                <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#0F766E]">
                  Explore {ind.shortName}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-[#0F766E] text-white py-20 px-4 sm:px-6 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            See how Trust Logistic fits your transport model
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
