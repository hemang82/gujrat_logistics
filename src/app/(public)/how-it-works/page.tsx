import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HowItWorksPage() {
  return (
    <div className="pt-28 pb-20 bg-white min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">How LogiMaster Works</h1>
          <p className="text-xl text-gray-600">From setup to scaling, see how our software streamlines your daily operations.</p>
        </div>

        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
          {[
            { step: 'Step 1', title: 'Onboarding & Setup', desc: 'Our team helps you import your existing data (branches, vehicles, drivers) into the system. You get custom logins for your staff across all branches.' },
            { step: 'Step 2', title: 'Daily Operations', desc: 'Your staff can start generating LRs and Challans in seconds. The system auto-calculates freights, links E-way bills, and manages crossing memos instantly.' },
            { step: 'Step 3', title: 'Tracking & Dispatch', desc: 'Track your fleet, manage hired lorries, and ensure goods are delivered on time. Automated alerts for driver license expiry and vehicle maintenance.' },
            { step: 'Step 4', title: 'Accounting & Billing', desc: 'At the end of the trip, the system auto-generates driver settlements, checks profitability, and creates GST-ready invoices for your clients.' },
          ].map((item, i) => (
            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-brand-primary text-white font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm">
                {i + 1}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl border border-gray-100 bg-gray-50 shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all">
                <div className="text-brand-primary font-bold mb-1 text-sm tracking-widest uppercase">{item.step}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <Link href="/demo">
            <Button size="lg" className="bg-brand-primary hover:bg-brand-primary-dark text-white rounded-full px-10 h-16 font-extrabold text-lg shadow-xl shadow-brand-primary/30">
              See it in Action — Book a Demo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
