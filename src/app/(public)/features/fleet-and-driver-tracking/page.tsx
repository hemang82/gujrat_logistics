import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Truck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Fleet & Driver Tracking Software - Trust Logistic',
  description: 'Track your fleet, manage drivers, and monitor lorry hire expenses efficiently with Trust Logistic TMS.',
  alternates: {
    canonical: 'https://trustlogistic.in/features/fleet-and-driver-tracking',
  }
};

export default function FleetTrackingPage() {
  return (
    <main className="pt-28 pb-20 bg-gray-50 min-h-screen">
      <article className="container mx-auto px-4 max-w-5xl">
        <div className="bg-white rounded-3xl shadow-xl shadow-brand-primary/5 p-8 md:p-12">
          
          <header className="mb-12 text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Truck className="w-8 h-8 text-brand-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Fleet & Driver Tracking</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Take complete control of your assets. Manage your own fleet or market-hired lorries effortlessly while tracking driver advances, expenses, and document expiry dates.
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div className="order-2 md:order-1 bg-gray-100 rounded-2xl h-80 flex items-center justify-center relative overflow-hidden border border-gray-200 shadow-inner">
               <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/5 to-transparent"></div>
               <p className="text-gray-400 font-semibold italic relative z-10">[ Fleet Dashboard Preview ]</p>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Total Visibility & Control</h2>
              <p className="text-gray-600 text-lg">
                Never lose track of a vehicle again. Our software helps you maintain a digital ledger for every driver and vehicle, ensuring all maintenance costs and trip advances are logged accurately.
              </p>
              <ul className="space-y-4">
                {['Vehicle Document Expiry Alerts', 'Driver Advance & Settlement Ledger', 'Lorry Hire Agreements', 'Real-time Trip Status Tracking'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="bg-brand-bg rounded-2xl p-10 text-center border border-brand-primary/10">
            <h3 className="text-2xl font-bold text-brand-primary-dark mb-4">Start optimizing your fleet today</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">Get intelligent insights into your fleet's performance and driver expenses.</p>
            <Link href="/contact" className="inline-flex h-14 items-center justify-center px-8 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-primary-dark shadow-lg transition-transform hover:-translate-y-1">
              Contact Sales <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </section>

        </div>
      </article>
    </main>
  );
}
