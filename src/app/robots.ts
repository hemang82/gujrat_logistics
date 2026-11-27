import type { MetadataRoute } from 'next';
import { COMPANY } from '@/lib/company';

/**
 * Generated robots rules from centralized company config.
 * Disallows internal admin workspace, API endpoints and thank-you route.
 * Public draft pages remain crawlable so bots read `<meta name="robots" content="noindex, nofollow">`
 * and remain excluded from `/sitemap.xml`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/login', '/request-a-demo/thank-you/'],
      },
    ],
    sitemap: `${COMPANY.domain}/sitemap.xml`,
    host: COMPANY.domain,
  };
}
