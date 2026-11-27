'use client';

import { useState, useId } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Minus, Plus } from 'lucide-react';
import { HOME_FAQS } from '@/content/faqs';
import { buildFaqSchema } from '@/lib/seo';
import { JsonLd } from './JsonLd';
import { DemoCtaRow, SectionHeader } from './SectionHeader';

const PRICING_HIGHLIGHTS = [
  'Support for FTL and PTL workflows',
  'LR, challan, e-way bill and billing in one system',
  'Plans for single and multi-branch operators',
  'Guided demo before you decide',
];

export function PricingAndFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();

  return (
    <section
      aria-labelledby="pricing-preview-heading"
      className="bg-[#F3F7F7] py-14 md:py-24 border-t border-[#0F766E]/10"
    >
      <JsonLd data={buildFaqSchema(HOME_FAQS)} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          headingId="pricing-preview-heading"
          eyebrow="Pricing & FAQs"
          title="Plans that fit how your transport business runs"
          subtitle="Tell us about your modules, branches and operations, and we will recommend the right plan."
        />

        {/* Side-by-Side Pricing Summary (Left) & Compact FAQ Accordion (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* Pricing Preview Card */}
          <div className="lg:col-span-5 rounded-3xl bg-white border border-[#0F766E]/15 p-4 sm:p-5 space-y-3.5 shadow-xs">
            <ul className="space-y-1.5">
              {PRICING_HIGHLIGHTS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-base font-semibold text-[#06262A] leading-snug"
                >
                  <CheckCircle2
                    className="w-4.5 h-4.5 text-[#0F766E] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl bg-[#F3F7F7] p-3.5 sm:p-4 border border-[#0F766E]/15 space-y-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-[#0F766E]">
                  Plan Information
                </p>
                <p className="mt-0.5 text-xl sm:text-2xl font-extrabold text-[#06262A]">
                  Contact us for pricing
                </p>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2">
                <Link
                  href="/request-a-demo/"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-[#06262A] font-extrabold text-sm px-3.5 py-2.5 transition-transform hover:-translate-y-0.5"
                >
                  Request a Demo
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </Link>
                <Link
                  href="/pricing/"
                  className="flex-1 inline-flex items-center justify-center rounded-full border border-[#0F766E]/25 bg-white hover:bg-[#0F766E] hover:text-white text-[#0F766E] font-bold text-sm px-3.5 py-2.5 transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="lg:col-span-7 space-y-1.5">
            <h3 className="text-lg font-extrabold text-[#06262A] mb-2">
              Frequently asked questions
            </h3>
            {HOME_FAQS.map((item, idx) => {
              const isOpen = openIndex === idx;
              const buttonId = `${baseId}-btn-${idx}`;
              const panelId = `${baseId}-panel-${idx}`;

              return (
                <div
                  key={item.question}
                  className={`rounded-2xl border bg-white transition-colors ${
                    isOpen ? 'border-[#0F766E]/40 shadow-xs' : 'border-[#0F766E]/12'
                  }`}
                >
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full px-3.5 sm:px-4 py-2.5 md:py-2 text-left flex items-center justify-between gap-2.5 cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
                  >
                    <span
                      className={`text-base font-bold transition-colors ${
                        isOpen ? 'text-[#0F766E]' : 'text-[#06262A]'
                      }`}
                    >
                      {item.question}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isOpen
                          ? 'bg-[#0F766E] text-white'
                          : 'bg-[#F3F7F7] text-[#06262A]'
                      }`}
                      aria-hidden="true"
                    >
                      {isOpen ? (
                        <Minus className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 sm:px-5 pb-4 pt-1 text-base text-[#52666B] leading-snug border-t border-[#F3F7F7]">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        <DemoCtaRow
          prompt="Have questions about branch setup, pricing or modules before starting?"
          secondaryHref="/company/contact/"
          secondaryLabel="Contact Us"
        />
      </div>
    </section>
  );
}
