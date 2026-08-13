import { Metadata } from 'next';
import Link from 'next/link';
import { UserCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { AnimatedSection, AnimatedStaggerContainer, AnimatedStaggerItem } from '@/components/ui/animated-section';

export const metadata: Metadata = {
  title: 'Driver KYC & Management Software in India',
  description: 'Manage truck drivers securely. Track driving licenses, KYC documents, and past trip history with Trust Logistic driver management system.',
  alternates: {
    canonical: 'https://trustlogistic.in/features/driver-kyc-software',
  }
};

export default function DriverKYCPage() {
  return (
    <main className="pt-36 md:pt-40 pb-20 bg-white min-h-screen">
      <article className="container mx-auto px-4 max-w-7xl">
        <div className="bg-gray-50 rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          
          <AnimatedSection className="mb-12 text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserCheck className="w-8 h-8 text-brand-primary" />
            </div>
            <h1 className="mb-6 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Driver KYC & Management</h1>
            <p className="text-base text-gray-600 leading-relaxed">
              Verify your drivers before you hand over the keys. Keep all driver details, license expirations, and trip histories in one secure digital locker.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <AnimatedSection className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Stop License Expiry Surprises</h2>
              <p className="text-gray-600 text-base">
                Getting fined at checkpoints hurts profitability. Trust Logistic automatically alerts you when a driver's license or vehicle fitness certificate is about to expire.
              </p>
              <AnimatedStaggerContainer className="space-y-4">
                {['Digital Storage for Aadhar & License', 'Expiry Alert Notifications', 'Driver-wise Advance Ledgers', 'Trip Assignment History'].map((item, i) => (
                  <AnimatedStaggerItem key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0" />
                    {item}
                  </AnimatedStaggerItem>
                ))}
              </AnimatedStaggerContainer>
            </AnimatedSection>
            <AnimatedSection delay={0.2} className="bg-white rounded-3xl h-80 flex items-center justify-center relative overflow-hidden border border-gray-200 shadow-xl">
               <div className="absolute inset-0 bg-gradient-to-bl from-brand-primary/5 to-transparent"></div>
               <p className="text-gray-400 font-semibold italic relative z-10">[ Driver Management Screen ]</p>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={0.4} className="bg-brand-primary rounded-3xl p-10 text-center text-white">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Protect your fleet and your cargo</h3>
            <p className="text-brand-primary-light mb-8 max-w-2xl mx-auto text-base">Always know exactly who is driving your trucks.</p>
            <Link href="/demo" className="inline-flex h-14 items-center justify-center px-8 rounded-full font-bold text-brand-primary bg-white hover:bg-gray-50 shadow-lg transition-transform hover:-translate-y-1">
              Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </AnimatedSection>

        </div>
      </article>
    </main>
  );
}

