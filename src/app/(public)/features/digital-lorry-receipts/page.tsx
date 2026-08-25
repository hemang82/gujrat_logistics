import { Metadata } from 'next';
import Link from 'next/link';
import { FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { AnimatedSection, AnimatedStaggerContainer, AnimatedStaggerItem } from '@/components/ui/animated-section';

export const metadata: Metadata = {
  title: 'Online Bilty Maker & Lorry Receipt (LR) Software in India',
  description: 'Generate 100% compliant, digital Lorry Receipts (LR/Bilty) in seconds. Best Online Bilty format software for transporters in India. Share instantly via WhatsApp.',
  keywords: [
    'Online Bilty Maker',
    'Lorry Receipt Format Generator',
    'LR Software India',
    'Digital Bilty Software',
    'Transport Bilty Maker',
    'Online LR Maker for Transporters'
  ],
  alternates: {
    canonical: 'https://trustlogistic.in/features/digital-lorry-receipts',
  }
};

export default function DigitalLRPage() {
  return (
    <main className="pt-36 md:pt-40 pb-20 bg-white min-h-screen">
      <article className="container mx-auto px-4 max-w-7xl">
        <div className="bg-gray-50 rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          
          <AnimatedSection className="mb-12 text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-brand-primary" />
            </div>
            <h1 className="mb-6 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Digital Lorry Receipts (LR & Bilty)</h1>
            <p className="text-base text-gray-600 leading-relaxed">
              Throw away your LR books. Generate professional, printed, and WhatsApp-ready Lorry Receipts in under 10 seconds.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <AnimatedSection className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Stop Handwriting Mistakes</h2>
              <p className="text-gray-600 text-base">
                Manual LR books lead to errors in weight, freight calculation, and lost paperwork. With Trust Logistic, your data is auto-saved, searchable, and always accurate.
              </p>
              <AnimatedStaggerContainer className="space-y-4">
                {['1-Click WhatsApp Sharing', 'Custom PDF Format with your Logo', 'Auto-sync with E-Way Bill', 'Search Old LRs instantly by Consignor Name'].map((item, i) => (
                  <AnimatedStaggerItem key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0" />
                    {item}
                  </AnimatedStaggerItem>
                ))}
              </AnimatedStaggerContainer>
            </AnimatedSection>
            <AnimatedSection delay={0.2} className="bg-white rounded-3xl h-80 flex items-center justify-center relative overflow-hidden border border-gray-200 shadow-xl">
               <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/5 to-transparent"></div>
               <p className="text-gray-400 font-semibold italic relative z-10">[ Digital LR Preview ]</p>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={0.4} className="bg-brand-primary rounded-3xl p-10 text-center text-white">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Start generating LRs for free today</h3>
            <p className="text-brand-primary-light mb-8 max-w-2xl mx-auto text-base">Save 5 minutes on every single booking you make.</p>
            <Link href="/demo" className="inline-flex h-14 items-center justify-center px-8 rounded-full font-bold text-brand-primary bg-white hover:bg-gray-50 shadow-lg transition-transform hover:-translate-y-1">
              Request a Demo <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </AnimatedSection>

        </div>
      </article>
    </main>
  );
}

