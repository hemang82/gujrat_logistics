import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'GST & E-Way Bill Software Integration - Trust Logistic',
  description: 'Generate GST compliant invoices and consolidated E-Way bills directly from your transport management software in one click.',
  alternates: {
    canonical: 'https://trustlogistic.in/features/gst-eway-bill-integration',
  }
};

export default function GSTPage() {
  return (
    <main className="pt-28 pb-20 bg-gray-50 min-h-screen">
      <article className="container mx-auto px-4 max-w-5xl">
        <div className="bg-white rounded-3xl shadow-xl shadow-brand-primary/5 p-8 md:p-12">
          
          <header className="mb-12 text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-brand-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">GST & E-Way Bill Integration</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Stay 100% compliant with Indian tax laws. Trust Logistic seamlessly integrates with government portals to generate GST invoices and consolidated E-Way Bills instantly.
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Zero Manual Data Entry</h2>
              <p className="text-gray-600 text-lg">
                Stop copying booking data into separate accounting software. Our system automatically pulls data from your Lorry Receipts (LRs) to generate flawless GST invoices and consolidated e-way bills with a single click.
              </p>
              <ul className="space-y-4">
                {['One-Click Consolidated E-Way Bills', 'GST Compliant Invoice Generation', 'Auto Tax Calculation (CGST/SGST/IGST)', 'Direct Government Portal Sync'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-100 rounded-2xl h-80 flex items-center justify-center relative overflow-hidden border border-gray-200 shadow-inner">
               <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent"></div>
               <p className="text-gray-400 font-semibold italic relative z-10">[ E-Way Bill System Preview ]</p>
            </div>
          </section>

          <section className="bg-brand-bg rounded-2xl p-10 text-center border border-brand-primary/10">
            <h3 className="text-2xl font-bold text-brand-primary-dark mb-4">Simplify your compliance today</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">Reduce accounting errors and save hours of manual data entry every single day.</p>
            <Link href="/contact" className="inline-flex h-14 items-center justify-center px-8 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-primary-dark shadow-lg transition-transform hover:-translate-y-1">
              Get Started Now <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </section>

        </div>
      </article>
    </main>
  );
}
