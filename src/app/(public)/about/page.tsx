import { Metadata } from 'next';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="pt-36 md:pt-40 pb-20 bg-white min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="mb-8 text-center text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Digitizing Gujarat's Transport Industry</h1>
        
        <div className="prose prose-lg mx-auto text-gray-600 space-y-6 leading-relaxed">
          <p>
            Trust Logistic was built by people who deeply understand the daily struggles of running a transport business in India. We saw first-hand how much time was wasted on manual paperwork, tracking down WhatsApp messages for old Challans, and losing money because balance freights weren't recorded properly.
          </p>
          <p>
            We realized that existing software was either too complex, not designed for the Indian market, or too expensive. 
          </p>
          <p>
            That's why we created <strong>Trust Logistic</strong> — an all-in-one logistics management software designed specifically for transporters, fleet owners, and logistics brokers. Our mission is to eliminate paperwork, ensure 100% compliance with GST and E-way bills, and help you scale your business with confidence.
          </p>
          <div className="bg-gray-50 p-8 rounded-full border border-gray-100 my-10">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Our Core Values</h3>
            <ul className="space-y-3 font-medium">
              <li>🚛 <strong className="text-gray-900">Built for India:</strong> Desi problems require desi solutions.</li>
              <li>⚡ <strong className="text-gray-900">Simplicity First:</strong> If your staff can use WhatsApp, they can use our software.</li>
              <li>🔒 <strong className="text-gray-900">Secure & Reliable:</strong> Your data is your property, securely backed up in the cloud.</li>
            </ul>
          </div>
            
          <div className="mt-8 border-t border-gray-100 pt-8">
            <h3 className="mb-4 text-2xl font-bold text-gray-900">Get in Touch</h3>
            <p className="mb-4">We are always ready to help you digitize your transport business. Feel free to reach out to our team in Gujarat:</p>
            <ul className="list-none space-y-2 mt-4 pl-0">
              <li><strong>Email:</strong> <a href="mailto:trustlogistic.in@gmail.com" className="text-brand-primary hover:underline">trustlogistic.in@gmail.com</a></li>
              <li><strong>Phone:</strong> +91 82384 03910</li>
              <li><strong>Office:</strong> Trust Logistic, Ahmedabad, Gujarat 382405, India</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );}


export const metadata: Metadata = {
  title: "About Trust Logistic - India's Top TMS",
  description: 'Learn about Trust Logistic, the leading transport management system built to solve the complex needs of Indian logistics companies.',
  alternates: {
    canonical: 'https://trustlogistic.in/about',
  }
};
