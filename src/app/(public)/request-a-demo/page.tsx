import type { Metadata } from 'next';
import { CheckCircle2, Phone } from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo';
import { COMPANY } from '@/lib/company';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { LeadForm } from '@/components/public/LeadForm';

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    path: '/request-a-demo/',
    title: 'Request a Demo | Trust Logistic Transport Software',
    description:
      'See Trust Logistic live: LR, challan, e-way bill, billing and accounts for FTL and PTL operations. Request a free demo for your transport business.',
    keywords: [
      'transport software demo',
      'LR software demo',
      'e-way bill software demo',
      'request demo transport management software',
    ],
  });
}

export default function RequestDemoPage() {
  return (
    <div className="bg-[#F3F7F7] pt-28 md:pt-36 pb-14 md:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs path="/request-a-demo/" />

        <div className="rounded-[1.75rem] sm:rounded-[2.25rem] overflow-hidden border border-[#0F766E]/15 bg-white shadow-xl grid grid-cols-1 lg:grid-cols-12">
          {/* Left Panel */}
          <div className="lg:col-span-5 bg-[#0A4F4A] text-white p-6 sm:p-12 flex flex-col justify-between">
            <div className="space-y-6">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#2DD4BF]">
                Live Product Walkthrough
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                See Trust Logistic work for your transport business
              </h1>
              <p className="text-base text-white/85 leading-relaxed">
                Book a free walkthrough with our team. We will show how a consignment moves from booking to final bill, using the same workflows your branches run every day, for full and part loads.
              </p>

              <ul className="space-y-4 pt-4">
                {[
                  'LR, lorry challan, crossing memo and lorry hire, from booking to dispatch',
                  'GSP e-way bills, Part-B updates and consolidated e-way bills',
                  'Freight billing, party ledgers and branch cash books',
                  'Fleet, driver records and reports for your branches',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base text-white/95">
                    <CheckCircle2 className="w-5 h-5 text-[#2DD4BF] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 pt-8 border-t border-white/15 space-y-2 text-sm text-white/80">
              <p className="font-bold text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#2DD4BF]" aria-hidden="true" />
                Direct Sales Desk: {COMPANY.contact.phoneDisplay}
              </p>
              <p>{COMPANY.contact.businessHours}</p>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="lg:col-span-7 p-2 sm:p-4 bg-[#F3F7F7]/40">
            <LeadForm sourceLabel="Schedule your Demo" />
          </div>
        </div>
      </div>
    </div>
  );
}
