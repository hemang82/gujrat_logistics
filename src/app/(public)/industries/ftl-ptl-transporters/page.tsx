import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Box } from 'lucide-react';
import { AnimatedSection, AnimatedStaggerContainer, AnimatedStaggerItem } from '@/components/ui/animated-section';

export const metadata: Metadata = {
  title: 'Logistics Software for FTL & PTL Transporters in India',
  description: 'Manage Full Truck Load (FTL) and Part Truck Load (PTL) operations, crossing memos, and multi-branch networks with Trust Logistic.',
  alternates: {
    canonical: 'https://trustlogistic.in/industries/ftl-ptl-transporters',
  }
};

export default function FTLPTLPage() {
  return (
    <main className="pt-36 md:pt-40 pb-20 bg-gray-50 min-h-screen">
      <article className="container mx-auto px-4 max-w-7xl">
        <div className="bg-white rounded-3xl shadow-xl shadow-brand-primary/5 p-8 md:p-12">
          
          <AnimatedSection className="mb-12 text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Box className="w-8 h-8 text-brand-primary" />
            </div>
            <h1 className="mb-6 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Software for FTL & PTL Transporters</h1>
            <p className="text-base text-gray-600 leading-relaxed">
              Whether you are moving bulk Full Truck Loads (FTL) or managing complex, multi-stop Part Truck Load (PTL) operations, Trust Logistic keeps your freight organized and profitable.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <AnimatedSection className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Master the Complexity of PTL</h2>
              <p className="text-gray-600 text-base">
                Consolidate multiple LRs into a single Lorry Challan with ease. Track unloading, crossing points, and final delivery status for every single parcel without missing a beat.
              </p>
              <AnimatedStaggerContainer className="space-y-4">
                {['Consolidated Lorry Challans', 'Multi-Stop Crossing Memos', 'Branch-to-Branch Material Tracking', 'Automated E-way Bill Consolidation'].map((item, i) => (
                  <AnimatedStaggerItem key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0" />
                    {item}
                  </AnimatedStaggerItem>
                ))}
              </AnimatedStaggerContainer>
            </AnimatedSection>
            <AnimatedSection delay={0.2} className="bg-gray-100 rounded-3xl h-80 flex items-center justify-center relative overflow-hidden border border-gray-200 shadow-inner">
               <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent"></div>
               <p className="text-gray-400 font-semibold italic relative z-10">[ FTL/PTL Loading Dashboard ]</p>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={0.4} className="bg-brand-bg rounded-3xl p-10 text-center border border-brand-primary/10">
            <h3 className="text-brand-primary-dark mb-4 text-lg font-bold">Scale your transport network securely</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-sm">Equip your branches and hubs with the software built for Indian load management.</p>
            <Link href="/contact" className="inline-flex h-14 items-center justify-center px-8 rounded-full font-bold text-white bg-brand-primary hover:bg-brand-primary-dark shadow-lg transition-transform hover:-translate-y-1">
              Talk to our Experts <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </AnimatedSection>

        </div>
      </article>
    </main>
  );
}

