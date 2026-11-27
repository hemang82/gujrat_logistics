import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  headingId?: string;
  tone?: 'light' | 'dark' | 'teal';
  align?: 'left' | 'center';
  action?: React.ReactNode;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  headingId,
  tone = 'light',
  align = 'left',
  action,
}: SectionHeaderProps) {
  const eyebrowClass =
    tone === 'dark'
      ? 'text-[#2DD4BF]'
      : tone === 'teal'
        ? 'text-[#D8FAF4]'
        : 'text-[#0F766E]';
  const titleClass = tone === 'light' ? 'text-[#06262A]' : 'text-white';
  const subClass =
    tone === 'dark'
      ? 'text-[#B3C1C3]'
      : tone === 'teal'
        ? 'text-white/90'
        : 'text-[#52666B]';

  if (align === 'center') {
    return (
      <div className="max-w-4xl mx-auto text-center mb-4 md:mb-6 space-y-1">
        <p className={`text-sm font-bold uppercase tracking-[0.2em] ${eyebrowClass}`}>
          {eyebrow}
        </p>
        <h2
          id={headingId}
          className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight ${titleClass}`}
        >
          {title}
        </h2>
        <p className={`text-base leading-snug ${subClass}`}>{subtitle}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4 md:mb-6">
      <div className={`${action ? 'max-w-3xl' : 'max-w-4xl'} space-y-1`}>
        <p className={`text-sm font-bold uppercase tracking-[0.2em] ${eyebrowClass}`}>
          {eyebrow}
        </p>
        <h2
          id={headingId}
          className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight ${titleClass}`}
        >
          {title}
        </h2>
        <p className={`text-base leading-snug ${subClass}`}>{subtitle}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface DemoCtaRowProps {
  prompt: string;
  tone?: 'light' | 'dark';
  surface?: 'white' | 'tint';
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function DemoCtaRow({
  prompt,
  tone = 'light',
  surface = 'white',
  secondaryHref,
  secondaryLabel,
}: DemoCtaRowProps) {
  const wrapClass =
    tone === 'dark'
      ? 'border-white/15 bg-white/5 text-white'
      : surface === 'tint'
        ? 'border-[#0F766E]/15 bg-[#F3F7F7] text-[#06262A]'
        : 'border-[#0F766E]/15 bg-white text-[#06262A]';
  const promptClass = tone === 'dark' ? 'text-white/90' : 'text-[#06262A]';
  const secondaryClass =
    tone === 'dark'
      ? 'border-white/25 text-white hover:bg-white/10'
      : 'border-[#0F766E]/25 text-[#0F766E] hover:bg-[#0F766E] hover:text-white';

  return (
    <div
      className={`mt-4 rounded-2xl border px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${wrapClass}`}
    >
      <p className={`text-base font-semibold leading-snug ${promptClass}`}>{prompt}</p>
      <div
        className={`shrink-0 w-full sm:w-auto gap-2 ${
          secondaryHref && secondaryLabel
            ? 'grid grid-cols-2 sm:flex sm:items-center'
            : 'flex'
        }`}
      >
        {secondaryHref && secondaryLabel && (
          <Link
            href={secondaryHref}
            className={`inline-flex items-center justify-center rounded-full border px-4 py-2.5 text-sm font-bold transition-colors ${secondaryClass}`}
          >
            {secondaryLabel}
          </Link>
        )}
        <Link
          href="/request-a-demo/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-[#06262A] font-extrabold text-sm px-4 sm:px-5 py-2.5 shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
        >
          Request a Demo
          <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
