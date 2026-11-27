import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { APPROVED_LEADERSHIP } from '@/content/proof';
import { LeadershipProfileTemplate } from '@/components/public/templates/LeadershipProfileTemplate';

export function generateStaticParams() {
  if (APPROVED_LEADERSHIP.length > 0) {
    return APPROVED_LEADERSHIP.map((l) => ({ name: l.slug }));
  }
  return [{ name: 'sample-leader' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  return buildPageMetadata({
    path: `/company/leadership/${name}/`,
    forceNoIndex: true,
  });
}

export default async function LeadershipMemberPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const profile = APPROVED_LEADERSHIP.find((p) => p.slug === name);
  return <LeadershipProfileTemplate slug={name} profile={profile} />;
}
