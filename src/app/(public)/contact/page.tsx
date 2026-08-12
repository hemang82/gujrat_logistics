import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Mail, MapPin, Phone, Clock } from 'lucide-react';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us - Trust Logistic',
  description: 'Get in touch with the Trust Logistic team for sales, support, and inquiries about our Transport Management System.',
  alternates: {
    canonical: 'https://trustlogistic.in/contact',
  }
};

export default function ContactPage() {
  return (
    <main className="pt-36 md:pt-40 pb-20 bg-gray-50 min-h-screen">
      <article className="container mx-auto px-4 max-w-7xl">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-brand-primary hover:text-brand-primary-dark mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side: Info */}
          <div>
            <h1 className="mb-6 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Get in touch with us.</h1>
            <p className="mb-10 max-w-lg text-base text-gray-600 leading-relaxed">
              Whether you want to request a demo, have a technical question, or need a custom enterprise plan, our team in Gujarat is ready to help you optimize your transport business.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0 border border-gray-100">
                  <MapPin className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-bold text-gray-900">Corporate Office</h3>
                  <p className="text-gray-600">Trust Logistic<br />Ahmedabad, Gujarat 382405<br />India</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0 border border-gray-100">
                  <Mail className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-bold text-gray-900">Email Us</h3>
                  <p className="text-gray-600">Sales & Support: <a href="mailto:trustlogistic.in@gmail.com" className="text-brand-primary hover:underline">trustlogistic.in@gmail.com</a></p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0 border border-gray-100">
                  <Phone className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-bold text-gray-900">Call Us</h3>
                  <p className="text-gray-600">+91 82384 03910</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0 border border-gray-100">
                  <Clock className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-bold text-gray-900">Business Hours</h3>
                  <p className="text-gray-600">Monday - Saturday: 9:00 AM - 7:00 PM (IST)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <ContactForm />
        </div>
      </article>
    </main>
  );
}

