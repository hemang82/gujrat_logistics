import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy - Trust Logistic',
  description: 'Refund and cancellation policy for Trust Logistic SaaS subscriptions.',
  alternates: {
    canonical: 'https://trustlogistic.in/refund',
  }
};

export default function RefundPage() {
  return (
    <main className="pt-28 pb-20 bg-gray-50 min-h-screen">
      <article className="container mx-auto px-4 max-w-4xl">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-brand-primary hover:text-brand-primary-dark mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        <div className="bg-white rounded-3xl shadow-xl shadow-brand-primary/5 p-8 md:p-12">
          <header className="mb-10 pb-10 border-b border-gray-100">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Refund & Cancellation Policy</h1>
            <p className="text-gray-500 font-medium">Last updated: August 2026</p>
          </header>

          <section className="prose prose-lg prose-green max-w-none text-gray-700 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">1. Subscription Cancellations</h2>
            <p>You can cancel your Trust Logistic subscription at any time. When you cancel, your subscription will remain active until the end of your current billing cycle (monthly or annually). We do not provide prorated refunds for mid-cycle cancellations.</p>
            
            <h2 className="text-2xl font-bold text-gray-900">2. Refund Eligibility</h2>
            <p>Refunds are only issued under the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Technical Failure:</strong> If you are unable to access the system for more than 72 consecutive hours due to server issues directly originating from Trust Logistic.</li>
              <li><strong>Accidental Duplicate Billing:</strong> If our payment gateway accidentally charges your card multiple times for the same subscription period.</li>
            </ul>
            <p>Refunds are not granted for changes of mind, failure to utilize the software, or lack of understanding of features. We highly recommend scheduling a free demo before purchasing a subscription to ensure the software fits your needs.</p>

            <h2 className="text-2xl font-bold text-gray-900">3. Refund Process</h2>
            <p>To request a refund for eligible reasons, please contact our support team at <strong>admin@trustlogistic.in</strong> within 7 days of the charge. Please include your Workspace ID and transaction receipt.</p>
            <p>Approved refunds will be processed and credited back to the original method of payment within 5-7 business days.</p>

            <h2 className="text-2xl font-bold text-gray-900">4. Changes to Service</h2>
            <p>Trust Logistic reserves the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. In the event of a permanent discontinuation of the Service, prorated refunds will be issued to active subscribers.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
