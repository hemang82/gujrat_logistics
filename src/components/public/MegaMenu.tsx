'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { type SitemapNode } from '@/lib/sitemap';

interface MegaMenuColumn {
  heading: string;
  items: SitemapNode[];
}

interface MegaMenuProps {
  isOpen: boolean;
  title: string;
  description: string;
  overviewHref: string;
  overviewLabel: string;
  columns: MegaMenuColumn[];
  onClose: () => void;
}

export function MegaMenu({
  isOpen,
  title,
  description,
  overviewHref,
  overviewLabel,
  columns,
  onClose,
}: MegaMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.99 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="absolute left-0 right-0 top-full pt-3 mx-auto max-w-[1080px] z-50"
          role="region"
          aria-label={`${title} navigation menu`}
        >
          <div className="rounded-3xl border border-[#0F766E]/15 bg-white/95 backdrop-blur-2xl p-6 shadow-[0_24px_60px_rgba(6,38,42,0.14)]">
            <div className="grid grid-cols-12 gap-6 items-start">
            {/* Overview Column */}
            <div className="col-span-4 rounded-2xl bg-[#F3F7F7] p-5 border border-[#0F766E]/10 flex flex-col justify-between min-h-[210px]">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-[#0F766E]">
                  {title}
                </p>
                <p className="mt-2 text-sm text-[#52666B] leading-relaxed">
                  {description}
                </p>
              </div>
              <Link
                href={overviewHref}
                onClick={onClose}
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#0F766E] hover:text-[#0A4F4A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] rounded-md"
              >
                {overviewLabel}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Links Columns */}
            <div className="col-span-8 grid grid-cols-2 gap-6">
              {columns.map((col) => (
                <div key={col.heading}>
                  <p className="text-sm font-bold uppercase tracking-wider text-[#52666B] mb-3 px-2">
                    {col.heading}
                  </p>
                  <ul className="space-y-1">
                    {col.items.map((item) => (
                      <li key={item.path}>
                        <Link
                          href={item.path}
                          onClick={onClose}
                          className="group block rounded-xl px-3 py-2.5 hover:bg-[#F3F7F7] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
                        >
                          <div className="text-sm font-semibold text-[#06262A] group-hover:text-[#0F766E] flex items-center justify-between">
                            <span>{item.navLabel}</span>
                            <ArrowRight
                              className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#0F766E]"
                              aria-hidden="true"
                            />
                          </div>
                          <p className="text-sm text-[#52666B] line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
