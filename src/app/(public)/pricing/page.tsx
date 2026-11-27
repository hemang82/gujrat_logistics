import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { PricingTemplate } from '@/components/public/templates/PricingTemplate';

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    path: '/pricing/',
    title: 'Transport Software Pricing & Plans | Trust Logistic',
    description:
      'Pricing for Trust Logistic transport software depends on the modules and setup your business needs. Contact us for a plan that fits.',
    keywords: [
      'transport software pricing',
      'LR software price',
      'transport management software plans',
      'transport billing software cost',
    ],
  });
}

export default function PricingPage() {
  return <PricingTemplate />;
}
