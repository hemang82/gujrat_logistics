'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, ArrowRight, MapPin } from 'lucide-react';
import { ASSETS } from '@/lib/assets';
import { getNavItemsByGroup, isPageLive, normalizePath } from '@/lib/sitemap';
import { MegaMenu } from './MegaMenu';

type OpenMenuKey = 'solutions' | 'industries' | 'company' | null;

export function Navbar() {
  const pathname = normalizePath(usePathname() || '/');
  const [openMenu, setOpenMenu] = useState<OpenMenuKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<OpenMenuKey>(null);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleOpenMenu = (menu: OpenMenuKey) => {
    cancelClose();
    setOpenMenu(menu);
  };

  const handleDelayedClose = () => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 150);
  };

  const coreSolutions = getNavItemsByGroup('mega-solutions-core');
  const opsSolutions = getNavItemsByGroup('mega-solutions-operations');
  const industriesList = getNavItemsByGroup('mega-industries');
  const companyItems = getNavItemsByGroup('mega-company');
  const showProjects = isPageLive('/projects/');
  const showResources = isPageLive('/resources/');
  const showPricing = isPageLive('/pricing/');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActive = (prefix: string) =>
    prefix === '/' ? pathname === '/' : pathname.startsWith(prefix);

  return (
    <header className="fixed top-4 md:top-5 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none">
      <nav
        ref={navRef}
        aria-label="Primary navigation"
        onMouseEnter={cancelClose}
        onMouseLeave={handleDelayedClose}
        className="mx-auto max-w-[1260px] pointer-events-auto relative"
      >
        <div
          className={`rounded-full border px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all duration-300 ${
            scrolled
              ? 'bg-white/92 backdrop-blur-2xl border-[#0F766E]/15 shadow-[0_14px_40px_rgba(6,38,42,0.12)]'
              : 'bg-white/80 backdrop-blur-xl border-white/90 shadow-[0_8px_30px_rgba(6,38,42,0.08)]'
          }`}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] pr-2"
            onClick={() => {
              setOpenMenu(null);
              setMobileOpen(false);
            }}
          >
            <Image
              src={ASSETS.brand.logo.src}
              alt={ASSETS.brand.logo.alt}
              width={182}
              height={48}
              priority
              unoptimized
              className="h-9 sm:h-11 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] ${
                isActive('/')
                  ? 'text-[#0F766E] bg-[#0F766E]/8'
                  : 'text-[#06262A] hover:text-[#0F766E]'
              }`}
            >
              Home
            </Link>

            {/* Solutions Mega Trigger */}
            <div
              className="relative"
              onMouseEnter={() => handleOpenMenu('solutions')}
            >
              <button
                type="button"
                aria-expanded={openMenu === 'solutions'}
                onClick={() =>
                  setOpenMenu(openMenu === 'solutions' ? null : 'solutions')
                }
                className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] ${
                  isActive('/solutions/')
                    ? 'text-[#0F766E] bg-[#0F766E]/8'
                    : 'text-[#06262A] hover:text-[#0F766E]'
                }`}
              >
                Solutions
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    openMenu === 'solutions' ? 'rotate-180 text-[#0F766E]' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Industries Mega Trigger */}
            <div
              className="relative"
              onMouseEnter={() => handleOpenMenu('industries')}
            >
              <button
                type="button"
                aria-expanded={openMenu === 'industries'}
                onClick={() =>
                  setOpenMenu(openMenu === 'industries' ? null : 'industries')
                }
                className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] ${
                  isActive('/industries/')
                    ? 'text-[#0F766E] bg-[#0F766E]/8'
                    : 'text-[#06262A] hover:text-[#0F766E]'
                }`}
              >
                Industries
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    openMenu === 'industries' ? 'rotate-180 text-[#0F766E]' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Phase 2 Live-when-approved nav items */}
            {showProjects && (
              <Link
                href="/projects/"
                className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-colors ${
                  isActive('/projects/')
                    ? 'text-[#0F766E] bg-[#0F766E]/8'
                    : 'text-[#06262A] hover:text-[#0F766E]'
                }`}
              >
                Projects
              </Link>
            )}

            {showResources && (
              <Link
                href="/resources/"
                className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-colors ${
                  isActive('/resources/')
                    ? 'text-[#0F766E] bg-[#0F766E]/8'
                    : 'text-[#06262A] hover:text-[#0F766E]'
                }`}
              >
                Resources
              </Link>
            )}

            {/* Company Dropdown Trigger */}
            <div
              className="relative"
              onMouseEnter={() => handleOpenMenu('company')}
            >
              <button
                type="button"
                aria-expanded={openMenu === 'company'}
                onClick={() =>
                  setOpenMenu(openMenu === 'company' ? null : 'company')
                }
                className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] ${
                  isActive('/company/')
                    ? 'text-[#0F766E] bg-[#0F766E]/8'
                    : 'text-[#06262A] hover:text-[#0F766E]'
                }`}
              >
                Company
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    openMenu === 'company' ? 'rotate-180 text-[#0F766E]' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>

            {showPricing && (
              <Link
                href="/pricing/"
                className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] ${
                  isActive('/pricing/')
                    ? 'text-[#0F766E] bg-[#0F766E]/8'
                    : 'text-[#06262A] hover:text-[#0F766E]'
                }`}
              >
                Pricing
              </Link>
            )}
          </div>

          {/* Right Utility Links & Primary CTA */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <Link
              href="/track"
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] ${
                pathname.startsWith('/track')
                  ? 'text-[#0F766E] bg-[#0F766E]/8'
                  : 'text-[#0F766E] hover:bg-[#0F766E]/8'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              Track LR
            </Link>
            <span className="h-4 w-px bg-[#06262A]/12" aria-hidden="true" />
            <Link
              href="/login"
              className="px-3 py-2 text-sm font-semibold text-[#52666B] hover:text-[#06262A] transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
            >
              Sign in
            </Link>
            <Link
              href="/request-a-demo/"
              className="inline-flex items-center gap-2 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-[#06262A] font-bold text-sm px-5 py-2.5 shadow-[0_6px_18px_rgba(245,158,11,0.3)] transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06262A]"
            >
              Request a Demo
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Tablet Sticky CTA + Mobile Hamburger */}
          <div className="lg:hidden flex items-center gap-2.5 shrink-0">
            <Link
              href="/request-a-demo/"
              className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-[#06262A] font-bold text-sm px-4 py-2 shadow-sm transition-colors"
            >
              Request a Demo
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center p-2.5 rounded-full text-[#06262A] hover:bg-[#F3F7F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* MegaMenus */}
        <MegaMenu
          isOpen={openMenu === 'solutions'}
          title="Solutions"
          description="Connected software modules built around real Indian LR / Bilty, Challan, E-Way Bill, fleet and branch accounting workflows."
          overviewHref="/solutions/"
          overviewLabel="Explore all Solutions"
          columns={[
            { heading: 'Booking & Compliance', items: coreSolutions },
            { heading: 'Fleet, Accounts & Reports', items: opsSolutions },
          ]}
          onClose={() => setOpenMenu(null)}
        />

        <MegaMenu
          isOpen={openMenu === 'industries'}
          title="Industries"
          description="Tailored workflows across booking & parcel transport companies, commercial fleet owners and transport brokers."
          overviewHref="/industries/"
          overviewLabel="Explore all Industries"
          columns={[
            { heading: 'Who We Serve', items: industriesList },
            {
              heading: 'Quick Actions',
              items: [
                {
                  path: '/request-a-demo/',
                  title: 'Request a Demo',
                  navLabel: 'Book a Live Walkthrough',
                  description: 'See how Trust Logistic maps to your branch network.',
                  parent: '/',
                  phase: 1,
                  status: 'live',
                  template: 'demo',
                  inSitemap: true,
                },
                {
                  path: '/pricing/',
                  title: 'Pricing',
                  navLabel: 'View Commercial Info',
                  description: 'Modular deployment options for Indian transporters.',
                  parent: '/',
                  phase: 1,
                  status: 'live',
                  template: 'pricing',
                  inSitemap: true,
                },
              ],
            },
          ]}
          onClose={() => setOpenMenu(null)}
        />

        <MegaMenu
          isOpen={openMenu === 'company'}
          title="Company"
          description="Built with focus on reliability, clean records and everyday simplicity for Indian transport offices."
          overviewHref="/company/about-us/"
          overviewLabel="About Trust Logistic"
          columns={[
            { heading: 'Corporate & Support', items: companyItems },
            {
              heading: 'Compliance & Legal',
              items: getNavItemsByGroup('footer-legal'),
            },
          ]}
          onClose={() => setOpenMenu(null)}
        />

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden mt-3 rounded-3xl bg-white/95 backdrop-blur-2xl border border-[#0F766E]/15 shadow-2xl p-4 max-h-[82vh] overflow-y-auto"
            >
              <div className="flex flex-col gap-1">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-2xl text-base font-semibold text-[#06262A] hover:bg-[#F3F7F7]"
                >
                  Home
                </Link>

                {/* Mobile Solutions Accordion */}
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setMobileAccordion(
                        mobileAccordion === 'solutions' ? null : 'solutions'
                      )
                    }
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-base font-semibold text-[#06262A] hover:bg-[#F3F7F7]"
                  >
                    <span>Solutions</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        mobileAccordion === 'solutions' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {mobileAccordion === 'solutions' && (
                    <div className="pl-4 pr-2 pb-2 space-y-1">
                      <Link
                        href="/solutions/"
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2 text-sm font-bold text-[#0F766E] rounded-xl hover:bg-[#F3F7F7]"
                      >
                        Solutions Overview →
                      </Link>
                      {[...coreSolutions, ...opsSolutions].map((item) => (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2.5 text-sm font-medium text-[#52666B] rounded-xl hover:bg-[#F3F7F7] hover:text-[#06262A]"
                        >
                          {item.navLabel}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Industries Accordion */}
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setMobileAccordion(
                        mobileAccordion === 'industries' ? null : 'industries'
                      )
                    }
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-base font-semibold text-[#06262A] hover:bg-[#F3F7F7]"
                  >
                    <span>Industries</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        mobileAccordion === 'industries' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {mobileAccordion === 'industries' && (
                    <div className="pl-4 pr-2 pb-2 space-y-1">
                      <Link
                        href="/industries/"
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2 text-sm font-bold text-[#0F766E] rounded-xl hover:bg-[#F3F7F7]"
                      >
                        All Industries →
                      </Link>
                      {industriesList.map((item) => (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2.5 text-sm font-medium text-[#52666B] rounded-xl hover:bg-[#F3F7F7] hover:text-[#06262A]"
                        >
                          {item.navLabel}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {showProjects && (
                  <Link
                    href="/projects/"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-2xl text-base font-semibold text-[#06262A] hover:bg-[#F3F7F7]"
                  >
                    Projects &amp; Success Stories
                  </Link>
                )}

                {showResources && (
                  <Link
                    href="/resources/"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-2xl text-base font-semibold text-[#06262A] hover:bg-[#F3F7F7]"
                  >
                    Resources
                  </Link>
                )}

                {/* Mobile Company Accordion */}
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setMobileAccordion(
                        mobileAccordion === 'company' ? null : 'company'
                      )
                    }
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-base font-semibold text-[#06262A] hover:bg-[#F3F7F7]"
                  >
                    <span>Company</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        mobileAccordion === 'company' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {mobileAccordion === 'company' && (
                    <div className="pl-4 pr-2 pb-2 space-y-1">
                      {companyItems.map((item) => (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2.5 text-sm font-medium text-[#52666B] rounded-xl hover:bg-[#F3F7F7] hover:text-[#06262A]"
                        >
                          {item.navLabel}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {showPricing && (
                  <Link
                    href="/pricing/"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-2xl text-base font-semibold text-[#06262A] hover:bg-[#F3F7F7]"
                  >
                    Pricing
                  </Link>
                )}

                <div className="mt-3 pt-3 border-t border-gray-200 flex flex-col gap-2.5">
                  <Link
                    href="/track"
                    onClick={() => setMobileOpen(false)}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold text-[#0F766E] border border-[#0F766E]/25 bg-[#F3F7F7] hover:bg-[#E6F1F0]"
                  >
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                    Track LR / Shipment
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center py-3 rounded-full text-sm font-semibold text-[#06262A] bg-[#F3F7F7] hover:bg-[#E6F1F0]"
                  >
                    Sign in to Portal
                  </Link>
                  <Link
                    href="/request-a-demo/"
                    onClick={() => setMobileOpen(false)}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-bold text-[#06262A] bg-[#F59E0B] hover:bg-[#D97706] shadow-md"
                  >
                    Request a Demo
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
