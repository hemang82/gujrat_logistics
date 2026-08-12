import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - Trust Logistic',
  description: 'Privacy Policy of Trust Logistic. Learn how we handle and protect your transport data securely in compliance with Indian laws.',
  alternates: {
    canonical: 'https://trustlogistic.in/privacy',
  }
};

export default function PrivacyPolicyPage() {
  return (
    <main className="pt-36 md:pt-40 pb-20 bg-gray-50 min-h-screen">
      <article className="container mx-auto px-4 max-w-7xl">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-brand-primary hover:text-brand-primary-dark mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        <div className="bg-white rounded-3xl shadow-xl shadow-brand-primary/5 p-8 md:p-12">
          <header className="mb-10 pb-10 border-b border-gray-100">
            <h1 className="mb-4 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Privacy Policy</h1>
            <p className="text-gray-500 font-medium">Last updated: August 2026</p>
          </header>

          <section className=" text-gray-700 space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">1. Introduction</h2>
            <p className="text-base text-gray-600 leading-relaxed">Welcome to Trust Logistic. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) or use our Transport Management System (TMS).</p>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">2. The Data We Collect About You</h2>
            <p className="text-base text-gray-600 leading-relaxed">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className="text-base text-gray-600 leading-relaxed list-disc pl-6 space-y-2">
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier, and title.</li>
              <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
              <li><strong>Financial Data</strong> includes bank account and payment card details processing for subscription purposes only.</li>
              <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
              <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
            </ul>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">3. How We Use Your Personal Data</h2>
            <p className="text-base text-gray-600 leading-relaxed">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="text-base text-gray-600 leading-relaxed list-disc pl-6 space-y-2">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., providing TMS services).</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation (e.g., GST or E-way bill compliance logging).</li>
            </ul>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">4. Data Security</h2>
            <p className="text-base text-gray-600 leading-relaxed">We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. We limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know. They will only process your personal data on our instructions and they are subject to a duty of confidentiality.</p>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">5. Contact Us</h2>
            <p className="text-base text-gray-600 leading-relaxed">If you have any questions about this privacy policy or our privacy practices, please contact us at:</p>
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
