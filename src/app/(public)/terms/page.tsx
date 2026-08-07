import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms and Conditions - Trust Logistic',
  description: 'Terms and Conditions for using Trust Logistic Transport Management System (TMS) in India.',
  alternates: {
    canonical: 'https://trustlogistic.in/terms',
  }
};

export default function TermsPage() {
  return (
    <main className="pt-28 pb-20 bg-gray-50 min-h-screen">
      <article className="container mx-auto px-4 max-w-4xl">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-brand-primary hover:text-brand-primary-dark mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        <div className="bg-white rounded-3xl shadow-xl shadow-brand-primary/5 p-8 md:p-12">
          <header className="mb-10 pb-10 border-b border-gray-100">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Terms & Conditions</h1>
            <p className="text-gray-500 font-medium">Last updated: August 2026</p>
          </header>

          <section className="prose prose-lg prose-green max-w-none text-gray-700 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">1. Acceptance of Terms</h2>
            <p>By accessing or using the Trust Logistic Transport Management System (the "Service") provided via the trustlogistic.in website, you agree to be bound by these Terms. If you disagree with any part of the terms, then you do not have permission to access the Service.</p>
            
            <h2 className="text-2xl font-bold text-gray-900">2. Description of Service</h2>
            <p>Trust Logistic provides a cloud-based logistics and transport management software designed to facilitate bookings, accounting, fleet tracking, and e-way bill generation for transporters in India. We constantly update our offerings and features.</p>

            <h2 className="text-2xl font-bold text-gray-900">3. Accounts & Security</h2>
            <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
            <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.</p>

            <h2 className="text-2xl font-bold text-gray-900">4. Acceptable Use Policy</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Upload or transmit any data that is unlawful, harmful, threatening, or abusive.</li>
              <li>Attempt to gain unauthorized access to our secure servers, databases, or API endpoints.</li>
              <li>Use the platform to generate fraudulent invoices or e-way bills. The responsibility for tax compliance lies strictly with the user.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900">5. Limitation of Liability</h2>
            <p>In no event shall Trust Logistic, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service.</p>

            <h2 className="text-2xl font-bold text-gray-900">6. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of India, specifically within the jurisdiction of Gujarat, without regard to its conflict of law provisions.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
