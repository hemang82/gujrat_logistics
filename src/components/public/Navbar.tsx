'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, Truck, ArrowRight } from 'lucide-react';
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
    <nav className="fixed top-6 inset-x-0 mx-auto w-full max-w-[1200px] z-50 px-4 transition-all duration-300">
      <div className="bg-white/65 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] border border-white/80 rounded-full py-3 px-5 flex items-center justify-between w-full relative overflow-hidden">
        {/* Subtle glossy top highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-white/0 via-white to-white/0 opacity-80 pointer-events-none" />
        
        <Link href="/" className="flex items-center group overflow-hidden shrink-0 pl-2">
          <div className="h-12 w-52 relative flex items-center justify-start transition-all">
            <img src="/main_logo.svg" alt="Trust Logistic Logo" className="w-full h-full object-contain origin-left" />
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-9">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-[15px] font-medium transition-colors ${
                pathname === link.href ? 'text-brand-primary font-bold' : 'text-gray-700 hover:text-brand-primary'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-5 pr-1">
           <Link href="/login" className="text-[15px] font-medium text-gray-700 hover:text-brand-primary transition-colors px-2">
            Sign in
          </Link>
          <Link href="/demo">
            <Button className="bg-brand-primary hover:bg-brand-primary-dark text-white rounded-full px-5 h-10 text-[14px] font-bold shadow-lg shadow-brand-primary/20 transition-all hover:-translate-y-0.5 cursor-pointer">
              Request a Demo
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-700 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[115%] left-4 right-4 bg-white/80 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] border border-white/80 rounded-2xl py-4 flex flex-col px-4 gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-gray-800 text-[15px] font-medium p-3 hover:bg-brand-primary/5 hover:text-brand-primary rounded-xl transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="border-t border-gray-200/50 mt-2 pt-4 flex flex-col gap-3">
             <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-800 text-[15px] font-medium p-3 hover:bg-brand-primary/5 hover:text-brand-primary rounded-xl transition-colors">
              Sign in
            </Link>
            <Link href="/demo" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full bg-brand-primary text-white rounded-xl h-12 text-[15px] font-bold">
                Request a Demo
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
