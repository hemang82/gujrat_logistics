import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Box } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Transport Management Software in India - Trust Logistic',
  description: 'Manage bookings, create Lorry Receipts (LRs), and dispatch trucks efficiently with Trust Logistic Transport Management System (TMS) built for India.',
  alternates: {
    canonical: 'https://trustlogistic.in/features/transport-management',
  }
};

export default function TransportManagementPage() {
  return (
    <main className="pt-36 md:pt-40 pb-20 bg-gray-50 min-h-screen">
      <article className="container mx-auto px-4 max-w-7xl">
        <div className="bg-white rounded-3xl shadow-xl shadow-brand-primary/5 p-8 md:p-12">
          
          <header className="mb-12 text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Box className="w-8 h-8 text-brand-primary" />
            </div>
            <h1 className="mb-6 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Advanced Transport Management</h1>
            <p className="text-base text-gray-600 leading-relaxed">
              Simplify your entire logistics operation. From taking booking orders to generating Lorry Receipts (LRs) and dispatching trucks, Trust Logistic handles everything in one secure dashboard.
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">End-to-End Booking Management</h2>
              <p className="text-base text-gray-600 leading-relaxed">
                No more paper diaries. Create digital bookings in seconds. Our intelligent system automatically calculates freight charges, generates sequential GR numbers, and stores consignor/consignee details for lightning-fast future entries.
              </p>
              <ul className="space-y-4">
                {['Digital Lorry Receipts (LR/Bilty)', 'Auto Freight Calculation', 'Multi-stop Route Planning', 'Consignor & Consignee Address Book'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-100 rounded-full h-80 flex items-center justify-center relative overflow-hidden border border-gray-200 shadow-inner">
               <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent"></div>
               <p className="text-gray-400 font-semibold italic relative z-10">[ Booking Dashboard Preview ]</p>
            </div>
          </section>

          <section className="bg-brand-bg rounded-full p-10 text-center border border-brand-primary/10">
            <h3 className="text-brand-primary-dark mb-4 text-lg font-bold">Ready to upgrade your transport business?</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">Join hundreds of logistics companies across India who have switched to Trust Logistic for a 100% paperless operation.</p>
            <Link href="/contact" className="inline-flex h-14 items-center justify-center px-8 rounded-full font-bold text-white bg-brand-primary hover:bg-brand-primary-dark shadow-lg transition-transform hover:-translate-y-1">
              Request a Free Demo <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </section>

        </div>
      </article>
    </main>
  );
}
