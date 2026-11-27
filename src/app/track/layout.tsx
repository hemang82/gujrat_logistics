import type { Metadata } from 'next';
import { COMPANY } from '@/lib/company';

export const metadata: Metadata = {
  title: 'Track Shipment (LR / Bilty Status)',
  description:
    'Check real-time consignment transit status, dispatch updates and delivery confirmation using your Trust Logistic LR / Bilty number.',
  alternates: {
    canonical: `${COMPANY.domain}/track`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
