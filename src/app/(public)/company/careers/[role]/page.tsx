import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo';
import { ACTIVE_CAREER_OPENINGS } from '@/content/proof';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { DraftBanner } from '@/components/public/DraftBanner';

export function generateStaticParams() {
  if (ACTIVE_CAREER_OPENINGS.length > 0) {
    return ACTIVE_CAREER_OPENINGS.map((j) => ({ role: j.slug }));
  }
  return [{ role: 'sample-role' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ role: string }>;
}): Promise<Metadata> {
  const { role } = await params;
  return buildPageMetadata({
    path: `/company/careers/${role}/`,
    forceNoIndex: true,
  });
}

export default async function CareerRolePage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  const path = `/company/careers/${role}/`;
  const job = ACTIVE_CAREER_OPENINGS.find((j) => j.slug === role);

  return (
    <div className="bg-[#F3F7F7] pt-32 md:pt-36 pb-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs path={path} currentLabel={job?.title || 'Role Detail'} />
        <DraftBanner
          phase={2}
          path={path}
          requirement="Confirm active role opening and job requirements in src/content/proof.ts before publishing."
        />

        <div className="rounded-[2.25rem] bg-white p-8 sm:p-12 border border-[#0F766E]/12 shadow-sm space-y-6">
          <p className="text-sm font-bold uppercase tracking-wider text-[#0F766E]">
            {job ? `${job.department} · ${job.location} · ${job.employmentType}` : '[Placeholder: Department · Location]'}
          </p>
          <h1 className="text-3xl font-extrabold text-[#06262A]">
            {job?.title || '[Placeholder: Open Position Title]'}
          </h1>
          <p className="text-base text-[#52666B]">
            {job?.summary || '[Placeholder: Verified role overview and team responsibilities.]'}
          </p>
          <div className="pt-4">
            <Link
              href="/company/contact/"
              className="inline-flex items-center gap-2 rounded-full bg-[#F59E0B] text-[#06262A] font-extrabold text-sm px-6 py-3"
            >
              Contact Hiring Team <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
