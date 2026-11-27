import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { type LaunchPhase } from '@/lib/sitemap';

interface DraftBannerProps {
  phase: LaunchPhase;
  path: string;
  requirement: string;
}

/**
 * Shown clearly on Phase 2 and Phase 3 scaffolded pages so unconfirmed content
 * is transparently marked as Draft / Noindex until approved and flipped to "live" in /lib/sitemap.ts.
 */
export function DraftBanner({ phase, path, requirement }: DraftBannerProps) {
  return (
    <div
      role="status"
      className="mb-8 rounded-2xl border-2 border-dashed border-[#F59E0B] bg-[#FFFBEB] px-5 py-4 text-[#06262A]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-[#92400E]">
              Phase {phase} Draft Scaffold · Excluded from XML Sitemap (noindex)
            </p>
            <p className="mt-1 text-sm text-[#06262A]">
              Route <code>{path}</code> is ready for review. Required before publishing:{' '}
              <strong>{requirement}</strong>
            </p>
          </div>
        </div>
        <Link
          href="/request-a-demo/"
          className="inline-flex items-center gap-1.5 shrink-0 rounded-full bg-[#F59E0B] px-4 py-2 text-sm font-bold text-[#06262A] hover:bg-[#D97706] transition-colors"
        >
          Request a Demo <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
