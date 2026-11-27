import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Navigation,
} from 'lucide-react';
import { ASSETS } from '@/lib/assets';
import { COMPANY, getWhatsAppUrl } from '@/lib/company';
import { getNavItemsByGroup } from '@/lib/sitemap';

export function Footer() {
  const solutionLinks = getNavItemsByGroup('footer-solutions').filter(
    (n) => n.path !== '/solutions/'
  );
  const industryLinks = getNavItemsByGroup('footer-industries');
  const companyLinks = getNavItemsByGroup('footer-company');
  const legalLinks = getNavItemsByGroup('footer-legal');

  return (
    <footer className="relative overflow-hidden bg-[#06262A] text-white border-t border-[#2DD4BF]/25">
      {/* Subtle top teal glow for depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(45,212,191,0.12),transparent_68%)]"
      />

      <div className="relative container mx-auto px-4 sm:px-6 max-w-7xl pt-10 pb-22 md:pb-7">
        {/* Main 5-column balanced grid on desktop, crisp stacked grid on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-[1.4fr_1.15fr_0.82fr_0.82fr_1.28fr] gap-6 lg:gap-7 pb-7 border-b border-white/10 items-start">
          {/* Column 1: Brand, Quick Actions & Socials */}
          <div className="col-span-2 lg:col-span-1 space-y-3.5">
            <Link
              href="/"
              className="inline-flex items-center rounded-2xl bg-white px-3.5 py-2 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF]"
            >
              <Image
                src={ASSETS.brand.logo.src}
                alt={ASSETS.brand.logo.alt}
                width={190}
                height={50}
                unoptimized
                className="h-9 w-auto object-contain"
              />
            </Link>

            <p className="text-sm text-[#C7D8DA] leading-relaxed max-w-sm">
              Transport management software for Indian transporters, fleet owners and transport brokers. Built for reliable daily bilty, dispatch, E-Way Bill and branch accounting operations.
            </p>

            {/* Primary Action Pills */}
            <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
              <Link
                href="/request-a-demo/"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-[#06262A] font-extrabold text-sm px-4 py-2 shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF]"
              >
                Request a Demo
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/track"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] hover:border-[#2DD4BF]/40 text-white font-semibold text-sm px-4 py-2 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-[#2DD4BF]" aria-hidden="true" />
                Track LR
              </Link>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2 pt-0.5">
              <a
                href={COMPANY.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Trust Logistic on LinkedIn"
                className="w-9 h-9 rounded-full bg-white/[0.07] border border-white/12 hover:bg-[#0F766E] hover:border-[#2DD4BF]/40 text-white flex items-center justify-center transition-all hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href={COMPANY.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Trust Logistic on Facebook"
                className="w-9 h-9 rounded-full bg-white/[0.07] border border-white/12 hover:bg-[#0F766E] hover:border-[#2DD4BF]/40 text-white flex items-center justify-center transition-all hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href={COMPANY.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Trust Logistic on Instagram"
                className="w-9 h-9 rounded-full bg-white/[0.07] border border-white/12 hover:bg-[#0F766E] hover:border-[#2DD4BF]/40 text-white flex items-center justify-center transition-all hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href={COMPANY.social.x}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Trust Logistic on X"
                className="w-9 h-9 rounded-full bg-white/[0.07] border border-white/12 hover:bg-[#0F766E] hover:border-[#2DD4BF]/40 text-white flex items-center justify-center transition-all hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Solutions */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[#2DD4BF] pb-2 mb-2.5 border-b border-white/10">
              Solutions
            </h3>
            <ul className="grid grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-1.5">
              <li>
                <Link
                  href="/solutions/"
                  className="text-sm font-semibold text-white hover:text-[#2DD4BF] transition-colors inline-block"
                >
                  Solutions Overview
                </Link>
              </li>
              {solutionLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className="text-sm text-[#C7D8DA] hover:text-[#2DD4BF] transition-colors inline-block"
                  >
                    {item.navLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Industries */}
          <div className="col-span-1 lg:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[#2DD4BF] pb-2 mb-2.5 border-b border-white/10">
              Industries
            </h3>
            <ul className="space-y-1.5">
              {industryLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className="text-sm text-[#C7D8DA] hover:text-[#2DD4BF] transition-colors inline-block"
                  >
                    {item.navLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="col-span-1 lg:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[#2DD4BF] pb-2 mb-2.5 border-b border-white/10">
              Company
            </h3>
            <ul className="space-y-1.5">
              {companyLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className="text-sm text-[#C7D8DA] hover:text-[#2DD4BF] transition-colors inline-block"
                  >
                    {item.navLabel}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/insights/"
                  className="text-sm text-[#C7D8DA] hover:text-[#2DD4BF] transition-colors inline-block"
                >
                  Blog &amp; Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/track"
                  className="text-sm text-[#C7D8DA] hover:text-[#2DD4BF] transition-colors inline-block"
                >
                  Track Shipment (LR)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Contact & Support Card */}
          <div className="col-span-2 lg:col-span-1">
            <div className="rounded-2xl bg-white/[0.04] border border-white/12 p-4 space-y-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[#2DD4BF]">
                Contact &amp; Support
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#2DD4BF] shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-sm text-[#D6E4E5]">
                    {COMPANY.contact.locationSummary}
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#2DD4BF] shrink-0" aria-hidden="true" />
                  <a
                    href={COMPANY.contact.phoneHref}
                    className="text-sm font-semibold text-white hover:text-[#2DD4BF] transition-colors"
                  >
                    {COMPANY.contact.phoneDisplay}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#2DD4BF] shrink-0" aria-hidden="true" />
                  <a
                    href={`mailto:${COMPANY.contact.primaryEmail}`}
                    className="text-sm text-[#C7D8DA] hover:text-white transition-colors break-all"
                  >
                    {COMPANY.contact.primaryEmail}
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#2DD4BF] shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-sm text-[#C7D8DA]">
                    {COMPANY.contact.businessHours}
                  </span>
                </li>
              </ul>

              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-[#06262A] font-extrabold text-sm px-4 py-2.5 transition-colors shadow-sm"
              >
                Chat on WhatsApp
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal Row */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#C7D8DA]">
          <p>
            &copy; {new Date().getFullYear()} {COMPANY.brandName}. All Rights Reserved by {COMPANY.brandName}.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
            {legalLinks.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="hover:text-[#2DD4BF] transition-colors"
              >
                {item.navLabel}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
