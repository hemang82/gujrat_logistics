'use client';

import { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { type FaqItem } from '@/content/faqs';
import { buildFaqSchema } from '@/lib/seo';
import { JsonLd } from './JsonLd';

interface FaqSectionProps {
  title?: string;
  eyebrow?: string;
  items: FaqItem[];
  className?: string;
  includeSchema?: boolean;
}

export function FaqSection({
  title = 'Frequently asked questions',
  eyebrow = 'FAQs',
  items,
  className = '',
  includeSchema = true,
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  if (!items || items.length === 0) return null;

  return (
    <section
      aria-labelledby={`${baseId}-heading`}
      className={`py-14 md:py-28 bg-[#F3F7F7] ${className}`}
    >
      {includeSchema && <JsonLd data={buildFaqSchema(items)} />}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F766E] mb-3">
            {eyebrow}
          </p>
          <h2
            id={`${baseId}-heading`}
            className="text-3xl md:text-4xl font-extrabold text-[#06262A] tracking-tight"
          >
            {title}
          </h2>
        </div>

        <div className="space-y-3.5">
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;
            const buttonId = `${baseId}-btn-${idx}`;
            const panelId = `${baseId}-panel-${idx}`;

            return (
              <div
                key={item.question}
                className={`rounded-2xl border bg-white transition-colors ${
                  isOpen ? 'border-[#0F766E]/40 shadow-sm' : 'border-[#0F766E]/12'
                }`}
              >
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4 cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
                >
                  <span
                    className={`text-base sm:text-lg font-bold transition-colors ${
                      isOpen ? 'text-[#0F766E]' : 'text-[#06262A]'
                    }`}
                  >
                    {item.question}
                  </span>
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isOpen
                        ? 'bg-[#0F766E] text-white'
                        : 'bg-[#F3F7F7] text-[#06262A]'
                    }`}
                    aria-hidden="true"
                  >
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
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
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-1 text-base text-[#52666B] leading-relaxed border-t border-[#F3F7F7]">
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
    </section>
  );
}
