import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Truck } from 'lucide-react';
import { AnimatedSection, AnimatedStaggerContainer, AnimatedStaggerItem } from '@/components/ui/animated-section';

export const metadata: Metadata = {
  title: 'Logistics & Transport Management Software for Fleet Owners in India',
  description: 'Manage your trucks, drivers, fuel expenses, and lorry hire securely. The perfect software for Indian Fleet Owners to track profitability per trip.',
  keywords: [
    'Fleet Management Software India',
    'Transport Software for Fleet Owners',
    'Truck Management Software',
    'Vehicle Tracking Software',
    'Trip Accounting Software'
  ],
  alternates: {
    canonical: 'https://trustlogistic.in/industries/fleet-owners',
  }
};

export default function FleetOwnersPage() {
  return (
    <main className="pt-36 md:pt-40 pb-20 bg-gray-50 min-h-screen">
      <article className="container mx-auto px-4 max-w-7xl">
        <div className="bg-white rounded-3xl shadow-xl shadow-brand-primary/5 p-8 md:p-12">
          
          <AnimatedSection className="mb-12 text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Truck className="w-8 h-8 text-brand-primary" />
            </div>
            <h1 className="mb-6 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Software for Fleet Owners</h1>
            <p className="text-base text-gray-600 leading-relaxed">
              Owning trucks is hard work. Managing them shouldn't be. Trust Logistic helps Indian fleet owners track every rupee spent on fuel, tolls, and driver advances while ensuring maximum vehicle utilization.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <AnimatedSection className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Total Asset Visibility</h2>
              <p className="text-gray-600 text-base">
                Replace your diaries and spreadsheets. Instantly know which truck is on which route, how much advance was given to the driver, and when the next maintenance or insurance renewal is due.
              </p>
              <AnimatedStaggerContainer className="space-y-4">
                {['Driver Advance & Settlement Ledger', 'Trip-wise Profit & Loss Reports', 'Vehicle Document Expiry Alerts (RTO/Fitness)', 'Fuel & Toll Expense Tracking'].map((item, i) => (
                  <AnimatedStaggerItem key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0" />
                    {item}
                  </AnimatedStaggerItem>
                ))}
              </AnimatedStaggerContainer>
            </AnimatedSection>
            <AnimatedSection delay={0.2} className="bg-gray-100 rounded-3xl h-80 flex items-center justify-center relative overflow-hidden border border-gray-200 shadow-inner">
               <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent"></div>
               <p className="text-gray-400 font-semibold italic relative z-10">[ Fleet Owner Dashboard ]</p>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={0.4} className="bg-brand-bg rounded-3xl p-10 text-center border border-brand-primary/10">
            <h3 className="text-brand-primary-dark mb-4 text-lg font-bold">Take control of your fleet's profitability</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-sm">Stop guessing your margins. Join hundreds of smart fleet owners in India using Trust Logistic.</p>
            <Link href="/demo" className="inline-flex h-14 items-center justify-center px-8 rounded-full font-bold text-white bg-brand-primary hover:bg-brand-primary-dark shadow-lg transition-transform hover:-translate-y-1">
              Book a Free Demo <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </AnimatedSection>

        </div>
      </article>
    </main>
  );
}

