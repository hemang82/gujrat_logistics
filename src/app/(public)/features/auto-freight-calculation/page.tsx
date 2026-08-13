import { Metadata } from 'next';
import Link from 'next/link';
import { Calculator, CheckCircle2, ArrowRight } from 'lucide-react';
import { AnimatedSection, AnimatedStaggerContainer, AnimatedStaggerItem } from '@/components/ui/animated-section';

export const metadata: Metadata = {
  title: 'Auto Freight Calculation Software for Indian Logistics',
  description: 'Automate freight calculation, advance payments, and balance recovery. Trust Logistic handles weight-based, fixed, and per-km pricing instantly.',
  alternates: {
    canonical: 'https://trustlogistic.in/features/auto-freight-calculation',
  }
};

export default function AutoFreightPage() {
  return (
    <main className="pt-36 md:pt-40 pb-20 bg-white min-h-screen">
      <article className="container mx-auto px-4 max-w-7xl">
        <div className="bg-gray-50 rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          
          <AnimatedSection className="mb-12 text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calculator className="w-8 h-8 text-brand-primary" />
            </div>
            <h1 className="mb-6 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Auto Freight Calculation</h1>
            <p className="text-base text-gray-600 leading-relaxed">
              Stop using calculators and diaries. Automatically calculate total freight, deductions, advances, and TDS instantly when you generate a booking.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <AnimatedSection delay={0.2} className="order-2 md:order-1 bg-white rounded-3xl h-80 flex items-center justify-center relative overflow-hidden border border-gray-200 shadow-xl">
               <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/5 to-transparent"></div>
               <p className="text-gray-400 font-semibold italic relative z-10">[ Freight Calculation Demo ]</p>
            </AnimatedSection>
            <AnimatedSection className="order-1 md:order-2 space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Never Lose a Balance Payment</h2>
              <p className="text-gray-600 text-base">
                Automatically track "To Pay" and "T.B.B" (To Be Billed) freight types. The system keeps a ledger of exactly how much money is stuck in the market so you can recover it faster.
              </p>
              <AnimatedStaggerContainer className="space-y-4">
                {['Support for Weight, Qty, and Fixed pricing', 'Auto TDS and Hamali deductions', 'Driver Advance Tracking', 'Branch-level Cash Collection Reports'].map((item, i) => (
                  <AnimatedStaggerItem key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0" />
                    {item}
                  </AnimatedStaggerItem>
                ))}
              </AnimatedStaggerContainer>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={0.4} className="bg-brand-primary rounded-3xl p-10 text-center text-white">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Secure your revenue streams</h3>
            <p className="text-brand-primary-light mb-8 max-w-2xl mx-auto text-base">Accounting built specifically for the Indian transport workflow.</p>
            <Link href="/contact" className="inline-flex h-14 items-center justify-center px-8 rounded-full font-bold text-brand-primary bg-white hover:bg-gray-50 shadow-lg transition-transform hover:-translate-y-1">
              Talk to Sales <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </AnimatedSection>

        </div>
      </article>
    </main>
  );
}

