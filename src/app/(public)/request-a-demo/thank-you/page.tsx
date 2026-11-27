import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo';
import { COMPANY, getWhatsAppUrl } from '@/lib/company';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    path: '/request-a-demo/thank-you/',
    forceNoIndex: true,
  });
}

export default function DemoThankYouPage() {
  return (
    <div className="bg-[#F3F7F7] pt-36 pb-24 min-h-[75vh]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs path="/request-a-demo/thank-you/" />

        <div className="rounded-[2.25rem] bg-white p-8 sm:p-14 border border-[#0F766E]/15 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#F0FDF4] border border-[#0F766E]/25 text-[#0F766E] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" aria-hidden="true" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#06262A] tracking-tight">
            Your demo request has been received.
          </h1>
          <p className="text-base text-[#52666B] leading-relaxed max-w-xl mx-auto">
            Thank you for reaching out to Trust Logistic. Our team will review your workflow details and contact you during business hours ({COMPANY.contact.businessHours}).
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={getWhatsAppUrl('Hi Trust Logistic, I just submitted a demo request on your website.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-[#06262A] font-extrabold text-sm px-7 py-3.5 transition-colors"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              Message on WhatsApp
            </a>
            <Link
              href="/solutions/"
              className="inline-flex items-center gap-2 rounded-full border border-[#0F766E]/25 bg-[#F3F7F7] hover:bg-[#0F766E] hover:text-white text-[#0F766E] font-bold text-sm px-7 py-3.5 transition-colors"
            >
              Explore Solutions
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
