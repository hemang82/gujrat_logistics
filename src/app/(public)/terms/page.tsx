import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo';
import { COMPANY } from '@/lib/company';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    path: '/terms/',
    title: 'Terms & Conditions | Trust Logistic',
    description:
      'The terms that apply when you use the Trust Logistic website and transport management software, including accounts, acceptable use and governing law.',
    keywords: [
      'Trust Logistic terms and conditions',
      'transport software terms of service',
    ],
  });
}

export default function TermsPage() {
  return (
    <div className="bg-[#F3F7F7] pt-32 md:pt-36 pb-20">
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs path="/terms/" />

        <div className="rounded-[2.25rem] bg-white p-8 sm:p-12 border border-[#0F766E]/12 shadow-sm space-y-8">
          <header className="pb-6 border-b border-gray-100 space-y-2">
            <p className="text-sm font-bold uppercase tracking-wider text-[#0F766E]">
              Legal &amp; Compliance
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#06262A] tracking-tight">
              Terms &amp; Conditions
            </h1>
            <p className="text-sm text-[#52666B]">
              Last updated: {COMPANY.legal.lastUpdated}
            </p>
          </header>

          <div className="space-y-6 text-base text-[#52666B] leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-xl font-extrabold text-[#06262A]">1. Acceptance of Terms</h2>
              <p>
                These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your use of the <code>{COMPANY.domain}</code> website and software services (the &ldquo;Services&rdquo;) provided by {COMPANY.legalName} (&ldquo;Trust Logistic&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By accessing the website, creating an account or using the Services, you agree to these Terms. If you use the Services for a business, you confirm that you have authority to bind that business.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-extrabold text-[#06262A]">2. Platform Scope</h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>What we provide:</strong> Trust Logistic is web-based software for transport businesses covering LR / bilty, lorry challans, crossing memos, lorry hire, e-way bill generation through GSP integration, delivery management, fleet and driver records, freight billing, branch accounts and reports. The modules available depend on your plan.</li>
                <li><strong>What we are not:</strong> Trust Logistic is a software provider. We are not a carrier, freight forwarder or broker, and we do not move, store, insure or take responsibility for goods. Contracts of carriage are between transporters and their customers.</li>
                <li><strong>Tracking &amp; third-party systems:</strong> Public LR tracking shows status entered by the transporter. E-way bills are generated through a GSP and government systems whose availability and rules are outside our control.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-extrabold text-[#06262A]">3. Accounts &amp; Acceptable Use</h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>Accounts &amp; your data:</strong> Subscribers are responsible for keeping login details confidential, setting accurate branch permissions, and ensuring the accuracy and legality of consignment, party, vehicle and billing data entered into their accounts.</li>
                <li><strong>Compliance:</strong> You are responsible for meeting your own legal obligations, including e-way bill, transport and record-keeping rules. The software supports your work but does not replace professional advice.</li>
                <li><strong>Acceptable use &amp; IP:</strong> You agree not to misuse the Services, access other customers&apos; data, interfere with security or resell the software without permission. Trust Logistic and its software, design and content belong to us.</li>
                <li><strong>Fees, suspension &amp; disclaimer:</strong> Fees and billing cycles are set out in your plan or order form. We may suspend access if these Terms are breached or fees are unpaid. The Services are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis to the extent permitted by law.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-extrabold text-[#06262A]">4. Governing Law</h2>
              <p>
                These Terms are governed by the laws of India within the jurisdiction of {COMPANY.legal.jurisdiction}.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-extrabold text-[#06262A]">5. Contact</h2>
              <ul className="list-none space-y-1 text-sm text-[#06262A]">
                <li><strong>Email:</strong> {COMPANY.contact.primaryEmail}</li>
                <li><strong>Phone:</strong> {COMPANY.contact.phoneDisplay}</li>
                <li><strong>Location:</strong> {COMPANY.contact.locationSummary}</li>
              </ul>
            </section>
          </div>

          <footer className="pt-6 border-t border-gray-100">
            <Link
              href="/company/contact/"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0F766E] hover:underline"
            >
              Questions? Contact Us <ArrowRight className="w-4 h-4" />
            </Link>
          </footer>
        </div>
      </article>
    </div>
  );
}
