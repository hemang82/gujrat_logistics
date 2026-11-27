import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Mail, MapPin, MessageCircle, Phone, ArrowRight } from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo';
import { COMPANY, getWhatsAppUrl } from '@/lib/company';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { ContactForm } from './ContactForm';

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    path: '/company/contact/',
    title: 'Contact Trust Logistic | Sales & Customer Support',
    description:
      'Contact Trust Logistic for demos, sales enquiries and customer support. Tell us about your transport business and we will get back to you.',
    keywords: [
      'contact Trust Logistic',
      'transport software support',
      'transport software sales enquiry',
      'request a callback',
    ],
  });
}

export default function ContactPage() {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="bg-[#F3F7F7] pt-28 md:pt-36 pb-16 md:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs path="/company/contact/" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Contact & Support Details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F766E]">
                Contact &amp; Support
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#06262A] tracking-tight">
                Talk to the Trust Logistic team
              </h1>
              <p className="text-base text-[#52666B] leading-relaxed">
                Whether you are exploring transport software for the first time or already use Trust Logistic and need help, send us a message and our team will respond. For sales enquiries and demos, choose Sales in the form. For help with your account, choose Support and include your company name and a short description of the issue.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-white p-5 border border-[#0F766E]/12 flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-[#F3F7F7] text-[#0F766E] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#06262A]">Phone &amp; WhatsApp</h2>
                  <a
                    href={COMPANY.contact.phoneHref}
                    className="text-sm font-semibold text-[#0F766E] hover:underline"
                  >
                    {COMPANY.contact.phoneDisplay}
                  </a>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 border border-[#0F766E]/12 flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-[#F3F7F7] text-[#0F766E] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#06262A]">Email Support &amp; Sales</h2>
                  <a
                    href={`mailto:${COMPANY.contact.primaryEmail}`}
                    className="text-sm font-semibold text-[#0F766E] hover:underline break-all"
                  >
                    {COMPANY.contact.primaryEmail}
                  </a>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 border border-[#0F766E]/12 flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-[#F3F7F7] text-[#0F766E] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#06262A]">Location</h2>
                  <p className="text-sm text-[#52666B]">{COMPANY.contact.locationSummary}</p>
                  {isDev && !COMPANY.contact.hasVerifiedOfficeAddress && (
                    <p className="mt-1 text-sm text-[#92400E] bg-[#FFFBEB] px-2 py-1 rounded">
                      {COMPANY.contact.streetAddressPlaceholder}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 border border-[#0F766E]/12 flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-[#F3F7F7] text-[#0F766E] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#06262A]">Operating Hours</h2>
                  <p className="text-sm text-[#52666B]">{COMPANY.contact.businessHours}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#0F766E] hover:bg-[#0A4F4A] text-white font-bold text-sm px-6 py-3.5 transition-colors"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                Message on WhatsApp
              </a>
              <Link
                href="/request-a-demo/"
                className="inline-flex items-center gap-2 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-[#06262A] font-extrabold text-sm px-6 py-3.5 transition-colors"
              >
                Request a Demo <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
