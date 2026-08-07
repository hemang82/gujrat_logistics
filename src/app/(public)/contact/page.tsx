import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Mail, MapPin, Phone, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const metadata: Metadata = {
  title: 'Contact Us - Trust Logistic',
  description: 'Get in touch with the Trust Logistic team for sales, support, and inquiries about our Transport Management System.',
  alternates: {
    canonical: 'https://trustlogistic.in/contact',
  }
};

export default function ContactPage() {
  return (
    <main className="pt-28 pb-20 bg-gray-50 min-h-screen">
      <article className="container mx-auto px-4 max-w-6xl">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-brand-primary hover:text-brand-primary-dark mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side: Info */}
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Get in touch with us.</h1>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-lg">
              Whether you want to request a demo, have a technical question, or need a custom enterprise plan, our team in Gujarat is ready to help you optimize your transport business.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0 border border-gray-100">
                  <MapPin className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Corporate Office</h3>
                  <p className="text-gray-600">123 Logistics Park, Ring Road<br />Ahmedabad, Gujarat 380001<br />India</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0 border border-gray-100">
                  <Mail className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
                  <p className="text-gray-600">Sales & Support: <a href="mailto:admin@trustlogistic.in" className="text-brand-primary hover:underline">admin@trustlogistic.in</a></p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0 border border-gray-100">
                  <Phone className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
                  <p className="text-gray-600">+91 (123) 456-7890</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0 border border-gray-100">
                  <Clock className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Business Hours</h3>
                  <p className="text-gray-600">Monday - Saturday: 9:00 AM - 7:00 PM (IST)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="bg-white rounded-3xl shadow-xl shadow-brand-primary/5 p-8 md:p-10 border border-gray-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">First Name</label>
                  <Input placeholder="Rahul" className="h-12 bg-gray-50/50 border-gray-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Last Name</label>
                  <Input placeholder="Patel" className="h-12 bg-gray-50/50 border-gray-200" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Work Email</label>
                <Input type="email" placeholder="rahul@company.com" className="h-12 bg-gray-50/50 border-gray-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Company Name</label>
                <Input placeholder="Shreeji Transport" className="h-12 bg-gray-50/50 border-gray-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Message</label>
                <textarea 
                  className="w-full min-h-[120px] rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary transition-all resize-none" 
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <Button type="button" className="w-full h-14 text-base font-bold bg-brand-primary hover:bg-brand-primary-dark text-white rounded-xl shadow-lg shadow-brand-primary/20">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </article>
    </main>
  );
}
