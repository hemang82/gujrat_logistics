'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, Truck } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
  ];

  const shouldBeTransparent = false; // Disabled because hero section is light

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        !shouldBeTransparent
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <img src="/images/trust-logo.png" alt="Trust Logistic Logo" className="h-12 w-auto object-contain" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                !shouldBeTransparent 
                  ? (pathname === link.href ? 'text-brand-primary' : 'text-brand-text-secondary hover:text-brand-primary')
                  : (pathname === link.href ? 'text-white font-bold' : 'text-white/70 hover:text-white')
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/login" className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${!shouldBeTransparent ? 'text-gray-500 hover:text-brand-primary' : 'text-white/80 hover:text-white'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Login
          </Link>
          <div className={`w-px h-6 ${!shouldBeTransparent ? 'bg-gray-200' : 'bg-white/20'}`}></div>
          <Link href="/demo">
            <Button className="bg-brand-primary hover:bg-brand-primary-dark text-white rounded-full px-8 h-11 font-bold shadow-md active:scale-95 transition-all cursor-pointer">
              Book a Free Demo
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className={`md:hidden ${!shouldBeTransparent ? 'text-brand-text-primary' : 'text-white'}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-b border-gray-100 py-4 flex flex-col px-4 gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-brand-text-primary font-medium p-2 hover:bg-brand-bg rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
            <Link href="/demo" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full bg-brand-primary text-white mt-2 rounded-lg">
                Book a Free Demo
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
