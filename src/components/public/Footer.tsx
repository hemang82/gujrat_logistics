import Link from 'next/link';
import { Truck, Globe, MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-brand-primary-dark text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Link href="/" className="inline-flex items-center w-fit">
              <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-white/10 h-16 w-56 relative flex items-center justify-center overflow-hidden">
                <img src="/main_logo.svg" alt="Trust Logistic Logo" className="w-full h-full object-contain" />
              </div>
            </Link>
            <p className="text-sm text-gray-300 mt-2 leading-relaxed pr-4">
              India's Logistics Management Software. Digitize your transport business, streamline operations, and scale with ease.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="https://www.facebook.com/profile.php?id=61593276774969" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:bg-brand-primary hover:text-white transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              </a>
              <a href="https://x.com/trustlogisticin" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:bg-brand-primary hover:text-white transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
              <a href="https://www.linkedin.com/in/trust-logistic-06a5a0429/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:bg-brand-primary hover:text-white transition-all">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="https://www.instagram.com/trustlogistic.in/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:bg-brand-primary hover:text-white transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
              </a>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-white">Features</h3>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="/features/digital-lorry-receipts" className="text-gray-300 hover:text-white text-sm transition-colors">Digital Lorry Receipts (LR)</Link>
              </li>
              <li>
                <Link href="/features/auto-freight-calculation" className="text-gray-300 hover:text-white text-sm transition-colors">Auto Freight Calculation</Link>
              </li>
              <li>
                <Link href="/features/driver-kyc-software" className="text-gray-300 hover:text-white text-sm transition-colors">Driver KYC Management</Link>
              </li>
              <li>
                <Link href="/features/transport-management" className="text-gray-300 hover:text-white text-sm transition-colors">Transport Management</Link>
              </li>
              <li>
                <Link href="/features/fleet-and-driver-tracking" className="text-gray-300 hover:text-white text-sm transition-colors">Fleet Tracking</Link>
              </li>
              <li>
                <Link href="/features/gst-eway-bill-integration" className="text-gray-300 hover:text-white text-sm transition-colors">E-Way Bill Integration</Link>
              </li>
              <li>
                <Link href="/features/branch-accounting" className="text-gray-300 hover:text-white text-sm transition-colors">Branch Accounting</Link>
              </li>
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-white">Industries</h3>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="/industries/fleet-owners" className="text-gray-300 hover:text-white text-sm transition-colors">Fleet Owners</Link>
              </li>
              <li>
                <Link href="/industries/transport-brokers" className="text-gray-300 hover:text-white text-sm transition-colors">Transport Brokers</Link>
              </li>
              <li>
                <Link href="/industries/ftl-ptl-transporters" className="text-gray-300 hover:text-white text-sm transition-colors">FTL & PTL Transporters</Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-white">Company</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/about" className="text-gray-300 hover:text-white text-sm transition-colors">About Us</Link></li>
              <li><Link href="/pricing" className="text-gray-300 hover:text-white text-sm transition-colors">Pricing</Link></li>
              <li><Link href="/how-it-works" className="text-gray-300 hover:text-white text-sm transition-colors">How it Works</Link></li>
              <li><Link href="/blog" className="text-gray-300 hover:text-white text-sm transition-colors">Blog & Resources</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white text-sm transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-white">Reach Us</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-primary-light shrink-0" />
                <span className="text-sm text-gray-300">Trust Logistic, Ahmedabad, Gujarat, 382405</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-primary-light shrink-0" />
                <span className="text-sm text-gray-300">+91 82384 03910</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-primary-light shrink-0" />
                <span className="text-sm text-gray-300">trustlogistic.in@gmail.com</span>
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
