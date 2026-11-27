import Link from 'next/link';
import { ArrowRight, Briefcase } from 'lucide-react';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { AssetSlotView } from '@/components/public/AssetSlot';
import { DraftBanner } from '@/components/public/DraftBanner';
import { ASSETS } from '@/lib/assets';
import { type LeadershipProfile } from '@/content/proof';

interface LeadershipProfileTemplateProps {
  profile?: LeadershipProfile;
  slug: string;
}

export function LeadershipProfileTemplate({
  profile,
  slug,
}: LeadershipProfileTemplateProps) {
  const path = `/company/leadership/${slug}/`;
  const asset = {
    ...ASSETS.leadership.placeholderPortrait,
    src: profile?.photoSrc || null,
    alt: profile ? `${profile.name} — ${profile.role}` : 'Approved leadership portrait placeholder',
  };

  return (
    <div className="bg-[#F3F7F7] pt-32 md:pt-36 pb-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs path={path} currentLabel={profile?.name || 'Leadership Profile'} />
        <DraftBanner
          phase={2}
          path={path}
          requirement="Approved leadership name, verified role, portrait photo, bio and public LinkedIn URL."
        />

        <div className="rounded-[2.25rem] bg-white p-8 sm:p-12 border border-[#0F766E]/12 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-5 overflow-hidden rounded-3xl border border-[#0F766E]/15">
            <AssetSlotView asset={asset} darkSurface={false} />
          </div>

          <div className="md:col-span-7 space-y-5">
            <p className="text-sm font-bold uppercase tracking-wider text-[#0F766E]">
              {profile?.role || '[Placeholder: Approved Leadership Role]'}
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#06262A] tracking-tight">
              {profile?.name || '[Placeholder: Approved Leader Name]'}
            </h1>
            <p className="text-base text-[#52666B] leading-relaxed">
              {profile?.bio ||
                '[Placeholder: Short, factual leadership biography and operational background to be supplied before publication.]'}
            </p>

            <div className="pt-4 border-t border-gray-100 space-y-3">
              <h2 className="text-lg font-extrabold text-[#06262A] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#0F766E]" aria-hidden="true" />
                Relevant Experience
              </h2>
              <ul className="space-y-2 text-sm sm:text-base text-[#52666B] list-disc pl-5">
                {(profile?.experience.length
                  ? profile.experience
                  : ['[Placeholder: Add confirmed transport software & logistics experience items]']
                ).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {profile?.linkedinUrl && (
              <div className="pt-2">
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#0F766E] hover:underline"
                >
                  View public LinkedIn profile <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}

            <div className="pt-4">
              <Link
                href="/request-a-demo/"
                className="inline-flex items-center gap-2 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-[#06262A] font-extrabold text-sm px-6 py-3"
              >
                Request a Demo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
