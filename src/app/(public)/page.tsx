import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import { buildPageMetadata, buildSoftwareApplicationSchema } from '@/lib/seo';
import { JsonLd } from '@/components/public/JsonLd';
import HomeClient from './client-page';

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    path: '/',
    keywords: [
      'transport management software',
      'LR software',
      'e-way bill software for transporters',
      'transport billing software',
      'FTL transport software',
      'PTL transport software',
      'Trust Logistic',
    ],
  });
}

export default function HomePage() {
  const customTruckPath = path.join(process.cwd(), 'public', 'truck.webp');
  const hasCustomTruckWebp = fs.existsSync(customTruckPath);

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Trust Logistic Transport Management Software',
    description:
      'Web-based transport management software for Indian transporters, fleet owners and brokers. Connects digital LR / Bilty creation, Lorry Challans, Crossing Memos, Lorry Hire, delivery management, fleet and driver registers, GSP E-Way Bills, freight billing and branch accounting.',
    path: '/',
    featureList: [
      'LR / Bilty Creation (Paid, To-Pay & TBB)',
      'Lorry Challan, Crossing Memo & Lorry Hire Management',
      'E-Way Bill & Consolidated E-Way Bill (CEWB) via GSP Integration',
      'Delivery & Cash Collection Registers',
      'Fleet & Driver Profile and Advance Ledgers',
      'Transport Accounting, Freight Billing & Financial Reports',
    ],
  });

  return (
    <>
      <JsonLd data={softwareSchema} />
      <HomeClient hasCustomTruckWebp={hasCustomTruckWebp} />
    </>
  );
}
