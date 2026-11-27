import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo';
import { COMPANY } from '@/lib/company';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    path: '/company/about-us/',
    title: 'About Trust Logistic | Transport Software for India',
    description:
      'Trust Logistic builds transport management software for Indian transporters, fleet owners and brokers: LR, challan, e-way bill, billing and accounts.',
    keywords: [
      'about Trust Logistic',
      'transport software company India',
      'transport management software provider',
      'LR and e-way bill software',
    ],
  });
}

export default function AboutUsPage() {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="bg-[#F3F7F7] pt-28 md:pt-36">
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16 md:pb-20 space-y-10 md:space-y-12">
        <Breadcrumbs path="/company/about-us/" />

        {/* Company Overview */}
        <div className="rounded-[1.75rem] sm:rounded-[2.25rem] bg-white p-6 sm:p-12 md:p-14 border border-[#0F766E]/12 shadow-sm space-y-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F766E]">
            About Trust Logistic
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#06262A] tracking-tight leading-[1.1]">
            Software built around how Indian road freight really works
          </h1>
          <p className="text-base text-[#52666B] leading-relaxed max-w-4xl">
            Trust Logistic is transport management software for transporters, fleet owners and brokers across India. We bring LR booking, challans, GSP e-way bills, fleet and driver records, billing and accounts into one dependable system, so your team spends less time on paperwork and more time moving freight.
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

        {/* Journey & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-3xl bg-white p-8 border border-[#0F766E]/12 shadow-sm space-y-4">
            <p className="text-sm font-bold uppercase tracking-wider text-[#0F766E]">
              Our Story
            </p>
            <h2 className="text-2xl font-extrabold text-[#06262A]">
              Built from the daily reality of the transport office
            </h2>
            <p className="text-base text-[#52666B] leading-relaxed">
              Every transport office knows the routine: bilty books, handwritten challans, branch phone calls to ask where a consignment is, and a rush at the e-way bill portal just as vehicles are ready to leave. Trust Logistic was created in Ahmedabad, Gujarat to replace that scattered work with one connected record per consignment. From the first LR to the final freight bill, details are entered once and carried through challans, e-way bills, delivery updates, billing and accounts—supporting both full truckload (FTL) and part truckload (PTL) operations.
            </p>
          </div>

          <div className="rounded-3xl bg-[#0A4F4A] text-white p-8 shadow-sm space-y-4">
            <p className="text-sm font-bold uppercase tracking-wider text-[#2DD4BF]">
              Vision, Mission &amp; Values
            </p>
            <h2 className="text-2xl font-extrabold">
              What guides our work
            </h2>
            <ul className="space-y-3 text-base text-white/90">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#2DD4BF] shrink-0 mt-0.5" aria-hidden="true" />
                <span><strong>Vision:</strong> Help every Indian transport business run on dependable, digital and compliant systems.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#2DD4BF] shrink-0 mt-0.5" aria-hidden="true" />
                <span><strong>Mission:</strong> Give transporters practical software that covers the full freight lifecycle, from booking counter to invoice settlement.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#2DD4BF] shrink-0 mt-0.5" aria-hidden="true" />
                <span><strong>Values:</strong> Accuracy in every entry, simplicity for busy teams, and honest communication with our customers.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Dev-only Reminder for Optional Unconfirmed Blocks */}
        {isDev && (
          <div className="rounded-2xl border-2 border-dashed border-[#F59E0B] bg-[#FFFBEB] p-6 text-[#06262A]">
            <p className="text-sm font-bold uppercase tracking-wider text-[#92400E]">
              [Dev Placeholder · Hidden in Production] Company Milestones, Awards &amp; Certifications
            </p>
            <p className="mt-1 text-sm">
              Optional Company Journey Milestones, Leadership profiles, Awards and Certifications are hidden in production until verified details are provided.
            </p>
          </div>
        )}

        {/* Direct Contact Strip */}
        <div className="rounded-3xl bg-white p-8 border border-[#0F766E]/12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-extrabold text-[#06262A]">Connect with our team</h2>
            <div className="flex flex-wrap gap-6 text-sm text-[#52666B]">
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0F766E]" aria-hidden="true" />
                {COMPANY.contact.locationSummary}
              </span>
              <span className="inline-flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#0F766E]" aria-hidden="true" />
                {COMPANY.contact.phoneDisplay}
              </span>
              <span className="inline-flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0F766E]" aria-hidden="true" />
                {COMPANY.contact.primaryEmail}
              </span>
            </div>
          </div>
          <Link
            href="/company/contact/"
            className="inline-flex items-center gap-2 rounded-full bg-[#0F766E] hover:bg-[#0A4F4A] text-white font-bold text-sm px-6 py-3.5 transition-colors shrink-0"
          >
            Contact Us
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
