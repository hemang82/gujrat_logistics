import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getBreadcrumbs } from '@/lib/sitemap';
import { buildBreadcrumbSchema } from '@/lib/seo';
import { JsonLd } from './JsonLd';

interface BreadcrumbsProps {
  path: string;
  currentLabel?: string;
  variant?: 'light' | 'dark';
}

export function Breadcrumbs({
  path,
  currentLabel,
  variant = 'light',
}: BreadcrumbsProps) {
  const items = getBreadcrumbs(path, currentLabel);
  const schema = buildBreadcrumbSchema(items);

  return (
    <>
      <JsonLd data={schema} />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            const linkColor =
              variant === 'dark'
                ? 'text-[#2DD4BF] hover:text-white'
                : 'text-[#52666B] hover:text-[#0F766E]';
            const currentColor =
              variant === 'dark' ? 'text-white font-semibold' : 'text-[#06262A] font-semibold';
            const sepColor = variant === 'dark' ? 'text-white/40' : 'text-[#52666B]/60';

            return (
              <li key={item.href} className="inline-flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className={`w-4 h-4 shrink-0 ${sepColor}`} aria-hidden="true" />}
                {isLast ? (
                  <span aria-current="page" className={currentColor}>
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className={`transition-colors ${linkColor}`}>
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
