import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Handshake } from 'lucide-react';
import { AnimatedSection, AnimatedStaggerContainer, AnimatedStaggerItem } from '@/components/ui/animated-section';

export const metadata: Metadata = {
  title: 'Logistics Software for Transport Brokers & Commission Agents India',
  description: 'Manage market lorry hire, generate instant bilties, and track your commission margins perfectly with Trust Logistic software for brokers.',
  keywords: [
    'Software for Transport Brokers',
    'Transport Commission Agent Software',
    'Market Lorry Hire Software',
    'Broker Accounting Software',
    'Logistics Software for Brokers'
  ],
  alternates: {
    canonical: 'https://trustlogistic.in/industries/transport-brokers',
  }
};

export default function TransportBrokersPage() {
  return (
    <main className="pt-36 md:pt-40 pb-20 bg-gray-50 min-h-screen">
      <article className="container mx-auto px-4 max-w-7xl">
        <div className="bg-white rounded-3xl shadow-xl shadow-brand-primary/5 p-8 md:p-12">
          
          <AnimatedSection className="mb-12 text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Handshake className="w-8 h-8 text-brand-primary" />
            </div>
            <h1 className="mb-6 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Software for Transport Brokers</h1>
            <p className="text-base text-gray-600 leading-relaxed">
              Commission agents and brokers run the Indian logistics market. Trust Logistic helps you manage market lorry hire, client freight billing, and your commissions perfectly.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <AnimatedSection className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Never Lose a Commission (Dalali)</h2>
              <p className="text-gray-600 text-base">
                Brokering is a fast-paced business. Our software tracks exactly how much freight was billed to the client vs how much was paid to the market truck, automatically calculating your margin.
              </p>
              <AnimatedStaggerContainer className="space-y-4">
                {['Auto-calculates Brokerage & Commission', 'Client Billing vs Lorry Hire Ledgers', 'Manage Market Truck KYC & Blacklists', 'Track Pending Freight Collections'].map((item, i) => (
                  <AnimatedStaggerItem key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0" />
                    {item}
                  </AnimatedStaggerItem>
                ))}
              </AnimatedStaggerContainer>
            </AnimatedSection>
            <AnimatedSection delay={0.2} className="bg-gray-100 rounded-3xl h-80 flex items-center justify-center relative overflow-hidden border border-gray-200 shadow-inner">
               <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/5 to-transparent"></div>
               <p className="text-gray-400 font-semibold italic relative z-10">[ Broker Dashboard ]</p>
            </AnimatedSection>
          </div>

          <AnimatedSection className="bg-brand-bg rounded-3xl p-10 text-center border border-brand-primary/10">
            <h3 className="text-brand-primary-dark mb-4 text-lg font-bold">Digitize your transport brokerage</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-sm">Generate LRs and Challans in 10 seconds and share them directly with clients via WhatsApp.</p>
            <Link href="/demo" className="inline-flex h-14 items-center justify-center px-8 rounded-full font-bold text-white bg-brand-primary hover:bg-brand-primary-dark shadow-lg transition-transform hover:-translate-y-1">
              Start Your Free Trial <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </AnimatedSection>

        </div>
      </article>
    </main>
  );
}

