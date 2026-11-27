import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo';
import { COMPANY } from '@/lib/company';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    path: '/privacy-policy/',
    title: 'Privacy Policy | Trust Logistic',
    description:
      'How Trust Logistic collects, uses, protects and shares personal and business data across its website and transport software platform.',
    keywords: [
      'Trust Logistic privacy policy',
      'transport software data privacy',
    ],
  });
}

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#F3F7F7] pt-32 md:pt-36 pb-20">
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs path="/privacy-policy/" />

        <div className="rounded-[2.25rem] bg-white p-8 sm:p-12 border border-[#0F766E]/12 shadow-sm space-y-8">
          <header className="pb-6 border-b border-gray-100 space-y-2">
            <p className="text-sm font-bold uppercase tracking-wider text-[#0F766E]">
              Legal &amp; Compliance
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#06262A] tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-sm text-[#52666B]">
              Last updated: {COMPANY.legal.lastUpdated} · Regulated under applicable Indian law.
            </p>
          </header>

          <div className="space-y-6 text-base text-[#52666B] leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-xl font-extrabold text-[#06262A]">1. Scope</h2>
              <p>
                This Privacy Policy explains how {COMPANY.legalName} (&ldquo;Trust Logistic&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) handles personal data and business information when you visit our website (<code>{COMPANY.domain}</code>), contact us, request a demo, or use the Trust Logistic transport management software and related services (together, the &ldquo;Services&rdquo;).
              </p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>Website and enquiries:</strong> When you contact us or request a demo, we decide why and how your details are used.</li>
                <li><strong>Customer platform data:</strong> When a transport business uses Trust Logistic to manage its own LRs, challans, fleet and billing, that business decides what data to enter and why. We process this data on its behalf and under its instructions.</li>
              </ul>
              <p>
                This policy is written with applicable Indian law in mind, including the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023, as they apply to us from time to time.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-extrabold text-[#06262A]">2. Information We Process</h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>Website enquiries and demo requests:</strong> Name, phone number, email address, company name, city, fleet size and the message or requirements you share with us.</li>
                <li><strong>LR / bilty data:</strong> Consignor and consignee names and contact details, route, goods description, weight, freight and payment type (Paid, To-Pay or TBB) entered by our customers.</li>
                <li><strong>Challan, fleet and driver data:</strong> Lorry challans, crossing memos and lorry hire records, vehicle details and documents, and driver details such as licence information, advances and settlements entered by our customers.</li>
                <li><strong>E-way bill workflows:</strong> Details needed to generate, update and consolidate e-way bills, such as consignment and vehicle information, and the related request and response logs. Where required, this data is sent to a GST Suvidha Provider (GSP) to complete the e-way bill action.</li>
                <li><strong>Billing and account data:</strong> Freight bills, party ledgers, branch cash books and expense records maintained by our customers, and account details of authorised users of the platform.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-extrabold text-[#06262A]">3. Commercial Data Isolation</h2>
              <p>
                Each customer&apos;s business data belongs to that customer. We keep customer data separate by account, and only that customer&apos;s authorised users can access it. We do not use or sell one customer&apos;s operational client lists or freight rates to serve, benchmark or advertise to competing transporters or data brokers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-extrabold text-[#06262A]">4. Authorized Sharing &amp; Access Controls</h2>
              <p>We do not sell personal data. We share information only when needed:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>Service providers:</strong> Hosting, email, communication and support tools that help us run the Services, under confidentiality and security obligations.</li>
                <li><strong>GSP and government systems:</strong> To generate and update e-way bills when you ask us to.</li>
                <li><strong>Legal reasons:</strong> When required by law, court order or a lawful request from a government authority, or to protect our rights, users or the public.</li>
                <li><strong>Access controls:</strong> Access to the platform is limited to authorised users created by each customer with role-based branch permissions. Our own team accesses customer data only as needed for support, maintenance and security, under confidentiality obligations.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-extrabold text-[#06262A]">5. Data Retention &amp; Contact</h2>
              <p>
                We keep information for as long as needed for the purposes in this policy, to provide the Services, and to meet legal, tax and accounting obligations. Customer platform data is retained while the customer&apos;s account is active and as agreed with the subscribing operator. Depending on applicable law, you may ask to access, correct or erase your personal data, or raise a grievance about how it is handled.
              </p>
              <ul className="list-none space-y-1 pt-2 text-sm text-[#06262A]">
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
              Contact Privacy Desk <ArrowRight className="w-4 h-4" />
            </Link>
          </footer>
        </div>
      </article>
    </div>
  );
}
