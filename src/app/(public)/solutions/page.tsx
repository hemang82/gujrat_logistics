import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { SolutionsOverviewTemplate } from '@/components/public/templates/SolutionsOverviewTemplate';

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    path: '/solutions/',
    keywords: [
      'Transport Management System India',
      'LR Bilty Software',
      'Lorry Challan & Crossing Memo Software',
      'GSP E-Way Bill Integration',
      'Fleet & Driver Management',
      'Transport Accounting Software',
    ],
  });
}

export default function SolutionsPage() {
  return <SolutionsOverviewTemplate />;
}
