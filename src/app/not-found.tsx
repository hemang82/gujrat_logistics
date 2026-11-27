import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F3F7F7] text-[#06262A]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-32 pb-20 px-4">
        <div className="max-w-xl w-full rounded-[2.25rem] bg-white border border-[#0F766E]/15 p-8 sm:p-12 text-center shadow-lg space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#F3F7F7] text-[#0F766E] flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8" aria-hidden="true" />
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F766E]">
            Error 404
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#06262A] tracking-tight">
            We couldn&apos;t find that page.
          </h1>
          <p className="text-base text-[#52666B] leading-relaxed">
            The link may have moved or is not yet published. Explore our live platform solutions or schedule a live demo below.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#0F766E] hover:bg-[#0A4F4A] text-white font-bold text-sm px-6 py-3.5 transition-colors"
            >
              Return Home
            </Link>
            <Link
              href="/solutions/"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-[#0F766E]/25 bg-[#F3F7F7] hover:bg-[#E6F1F0] text-[#06262A] font-bold text-sm px-6 py-3.5 transition-colors"
            >
              Solutions
            </Link>
            <Link
              href="/request-a-demo/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-[#06262A] font-extrabold text-sm px-6 py-3.5 transition-colors"
            >
              Request a Demo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
