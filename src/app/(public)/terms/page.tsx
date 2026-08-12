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
    <main className="pt-36 md:pt-40 pb-20 bg-gray-50 min-h-screen">
      <article className="container mx-auto px-4 max-w-7xl">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-brand-primary hover:text-brand-primary-dark mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        <div className="bg-white rounded-3xl shadow-xl shadow-brand-primary/5 p-8 md:p-12">
          <header className="mb-10 pb-10 border-b border-gray-100">
            <h1 className="mb-4 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Terms & Conditions</h1>
            <p className="text-gray-500 font-medium">Last updated: August 2026</p>
          </header>

          <section className=" text-gray-700 space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">1. Acceptance of Terms</h2>
            <p className="text-base text-gray-600 leading-relaxed">By accessing or using the Trust Logistic Transport Management System (the "Service") provided via the trustlogistic.in website, you agree to be bound by these Terms. If you disagree with any part of the terms, then you do not have permission to access the Service.</p>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">2. Description of Service</h2>
            <p className="text-base text-gray-600 leading-relaxed">Trust Logistic provides a cloud-based logistics and transport management software designed to facilitate bookings, accounting, fleet tracking, and e-way bill generation for transporters in India. We constantly update our offerings and features.</p>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">3. Accounts & Security</h2>
            <p className="text-base text-gray-600 leading-relaxed">When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
            <p className="text-base text-gray-600 leading-relaxed">You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.</p>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">4. Acceptable Use Policy</h2>
            <p className="text-base text-gray-600 leading-relaxed">You agree not to use the Service to:</p>
            <ul className="text-base text-gray-600 leading-relaxed list-disc pl-6 space-y-2">
              <li>Upload or transmit any data that is unlawful, harmful, threatening, or abusive.</li>
              <li>Attempt to gain unauthorized access to our secure servers, databases, or API endpoints.</li>
              <li>Use the platform to generate fraudulent invoices or e-way bills. The responsibility for tax compliance lies strictly with the user.</li>
            </ul>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">5. Limitation of Liability</h2>
            <p className="text-base text-gray-600 leading-relaxed">In no event shall Trust Logistic, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service.</p>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">6. Governing Law</h2>
            <p className="text-base text-gray-600 leading-relaxed">These Terms shall be governed and construed in accordance with the laws of India, specifically within the jurisdiction of Gujarat, without regard to its conflict of law provisions.</p>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">7. Contact Us</h2>
            <p className="text-base text-gray-600 leading-relaxed">If you have any questions about these Terms, please contact us at:</p>
            <ul className="text-base text-gray-600 leading-relaxed list-none space-y-2 mt-4">
              <li><strong>Email:</strong> <a href="mailto:trustlogistic.in@gmail.com" className="text-brand-primary hover:underline">trustlogistic.in@gmail.com</a></li>
              <li><strong>Phone:</strong> +91 82384 03910</li>
              <li><strong>Address:</strong> Trust Logistic, Ahmedabad, Gujarat 382405, India</li>
            </ul>
          </section>
        </div>
      </article>
    </main>
  );
}
