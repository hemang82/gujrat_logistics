import Link from 'next/link';
import { Truck, Globe, Share2, MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-brand-primary-dark text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-brand-primary p-2 rounded-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Trust <span className="text-brand-primary-light">Logistic</span>
              </span>
            </Link>
            <p className="text-sm text-gray-300 mt-2 leading-relaxed">
              India's #1 Logistics Management Software. Digitize your transport business, streamline operations, and scale with ease.
            </p>
            <div className="flex gap-4 mt-2">
              <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Product</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/features" className="text-gray-300 hover:text-white text-sm transition-colors">Features</Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-300 hover:text-white text-sm transition-colors">How It Works</Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-300 hover:text-white text-sm transition-colors">Pricing</Link>
              </li>
              <li>
                <Link href="/demo" className="text-gray-300 hover:text-white text-sm transition-colors">Book a Demo</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Company</h3>
            <ul className="flex flex-col gap-2">
              <li><Link href="/about" className="text-gray-300 hover:text-white text-sm transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="text-gray-300 hover:text-white text-sm transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white text-sm transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Contact Us</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-primary-light shrink-0" />
                <span className="text-sm text-gray-300">123 Logistics Park, SG Highway, Ahmedabad, Gujarat 380015</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-primary-light shrink-0" />
                <span className="text-sm text-gray-300">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-primary-light shrink-0" />
                <span className="text-sm text-gray-300">hello@trustlogistic.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-700/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Trust Logistic. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
