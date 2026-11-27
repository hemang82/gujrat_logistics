import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Quote } from 'lucide-react';
import {
  APPROVED_CASE_STUDIES,
  APPROVED_LOGOS,
  APPROVED_TESTIMONIALS,
  hasApprovedProof,
} from '@/content/proof';

/**
 * Section 7 — Proof.
 * CRITICAL RULE: Renders ONLY when verified logos, testimonials or case studies exist
 * in `/content/proof.ts`. In production with no verified proof, returns `null` completely.
 */
export function ProofSection() {
  const hasProof = hasApprovedProof();
  const isDev = process.env.NODE_ENV === 'development';

  if (!hasProof && !isDev) {
    return null;
  }

  if (!hasProof && isDev) {
    return (
      <section
        aria-label="Proof section development placeholder"
        className="bg-white py-5 border-t border-[#0F766E]/10"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-xl border-2 border-dashed border-[#F59E0B] bg-[#FFFBEB] px-4 py-3 text-center text-[#06262A]">
            <p className="text-sm font-bold uppercase tracking-wider text-[#92400E]">
              [Dev Placeholder · Hidden in Production] Proof Section — Approve real logos/testimonials in <code>src/content/proof.ts</code>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="proof-heading"
      className="bg-white py-24 md:py-28 border-t border-[#0F766E]/10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F766E] mb-3">
            Verified Customer Proof
          </p>
          <h2
            id="proof-heading"
            className="text-3xl md:text-4xl font-extrabold text-[#06262A] tracking-tight"
          >
            Trusted in daily operations across approved deployments.
          </h2>
        </div>

        {APPROVED_LOGOS.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 items-center">
            {APPROVED_LOGOS.map((logo) => (
              <div
                key={logo.id}
                className="rounded-2xl bg-[#F3F7F7] p-5 border border-[#0F766E]/10 flex items-center justify-center h-24"
              >
                <Image
                  src={logo.logoSrc}
                  alt={logo.alt}
                  width={160}
                  height={60}
                  className="max-h-12 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        )}

        {APPROVED_TESTIMONIALS.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {APPROVED_TESTIMONIALS.map((item) => (
              <blockquote
                key={item.id}
                className="rounded-3xl bg-[#F3F7F7] p-8 border border-[#0F766E]/12"
              >
                <Quote className="w-8 h-8 text-[#0F766E] mb-4" aria-hidden="true" />
                <p className="text-base text-[#06262A] leading-relaxed font-medium">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <footer className="mt-6 text-sm">
                  <span className="font-bold text-[#06262A]">{item.personName}</span>
                  <span className="text-[#52666B]">
                    {' '}
                    · {item.role}, {item.companyName} ({item.city})
                  </span>
                </footer>
              </blockquote>
            ))}
          </div>
        )}

        {APPROVED_CASE_STUDIES.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {APPROVED_CASE_STUDIES.map((cs) => (
              <Link
                key={cs.slug}
                href={`/case-studies/${cs.slug}/`}
                className="rounded-3xl bg-[#F3F7F7] p-7 border border-[#0F766E]/12 hover:border-[#0F766E] transition-colors flex flex-col justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-[#0F766E]">{cs.segment}</p>
                  <h3 className="mt-2 text-lg font-extrabold text-[#06262A]">
                    {cs.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#52666B]">{cs.summary}</p>
                </div>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#0F766E]">
                  Read case study <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
