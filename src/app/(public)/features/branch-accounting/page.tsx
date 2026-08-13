import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Building2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Branch Accounting Software for Transporters - Trust Logistic',
  description: 'Manage unlimited transport branches, reconcile branch ledgers, and track branch-wise profitability with Trust Logistic.',
  alternates: {
    canonical: 'https://trustlogistic.in/features/branch-accounting',
  }
};

export default function BranchAccountingPage() {
  return (
    <main className="pt-36 md:pt-40 pb-20 bg-gray-50 min-h-screen">
      <article className="container mx-auto px-4 max-w-7xl">
        <div className="bg-white rounded-3xl shadow-xl shadow-brand-primary/5 p-8 md:p-12">
          
          <header className="mb-12 text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-8 h-8 text-brand-primary" />
            </div>
            <h1 className="mb-6 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Multi-Branch Accounting</h1>
            <p className="text-base text-gray-600 leading-relaxed">
              Scale your transport business across India. Manage unlimited branches, reconcile cash flows, and generate branch-wise profitability reports instantly.
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div className="order-2 md:order-1 bg-gray-100 rounded-3xl h-80 flex items-center justify-center relative overflow-hidden border border-gray-200 shadow-inner">
               <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/5 to-transparent"></div>
               <p className="text-gray-400 font-semibold italic relative z-10">[ Branch Accounting Preview ]</p>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Unified Financial Control</h2>
              <p className="text-base text-gray-600 leading-relaxed">
                Maintain a centralized view of your entire company's finances while giving branch managers the tools they need to operate locally. Track cash collections, daily expenses, and inter-branch transactions.
              </p>
              <ul className="space-y-4">
                {['Automated Branch Ledgers', 'Daily Cash Collection Reports', 'Inter-Branch Cash Transfers', 'Role-Based Access for Branch Managers'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="bg-brand-bg rounded-3xl p-10 text-center border border-brand-primary/10">
            <h3 className="text-brand-primary-dark mb-4 text-lg font-bold">Ready to connect your branches?</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">Unify your transport operations into a single, powerful system.</p>
            <Link href="/contact" className="inline-flex h-14 items-center justify-center px-8 rounded-full font-bold text-white bg-brand-primary hover:bg-brand-primary-dark shadow-lg transition-transform hover:-translate-y-1">
              Speak to an Expert <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </section>

        </div>
      </article>
    </main>
  );
}

