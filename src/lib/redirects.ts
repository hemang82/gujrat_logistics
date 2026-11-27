/**
 * Centralized 301/308 redirect rules so previously indexed URLs
 * seamlessly map to the new Trust Logistic URL architecture.
 *
 * All destinations include trailing slashes matching `/lib/sitemap.ts`.
 */

export interface RedirectRule {
  source: string;
  destination: string;
  permanent: boolean;
}

export const LEGACY_REDIRECTS: RedirectRule[] = [
  // Company & Conversion redirects
  { source: '/about', destination: '/company/about-us/', permanent: true },
  { source: '/about/', destination: '/company/about-us/', permanent: true },
  { source: '/contact', destination: '/company/contact/', permanent: true },
  { source: '/contact/', destination: '/company/contact/', permanent: true },
  { source: '/demo', destination: '/request-a-demo/', permanent: true },
  { source: '/demo/', destination: '/request-a-demo/', permanent: true },
  { source: '/privacy', destination: '/privacy-policy/', permanent: true },
  { source: '/privacy/', destination: '/privacy-policy/', permanent: true },
  { source: '/how-it-works', destination: '/solutions/', permanent: true },
  { source: '/how-it-works/', destination: '/solutions/', permanent: true },

  // Legacy Features -> Solutions redirects
  { source: '/features', destination: '/solutions/', permanent: true },
  { source: '/features/', destination: '/solutions/', permanent: true },
  {
    source: '/features/transport-management',
    destination: '/solutions/transport-management-software/',
    permanent: true,
  },
  {
    source: '/features/transport-management/',
    destination: '/solutions/transport-management-software/',
    permanent: true,
  },
  {
    source: '/features/digital-lorry-receipts',
    destination: '/solutions/lr-bilty-management/',
    permanent: true,
  },
  {
    source: '/features/digital-lorry-receipts/',
    destination: '/solutions/lr-bilty-management/',
    permanent: true,
  },
  {
    source: '/features/auto-freight-calculation',
    destination: '/solutions/transport-billing-invoicing/',
    permanent: true,
  },
  {
    source: '/features/auto-freight-calculation/',
    destination: '/solutions/transport-billing-invoicing/',
    permanent: true,
  },
  {
    source: '/features/branch-accounting',
    destination: '/solutions/transport-accounting/',
    permanent: true,
  },
  {
    source: '/features/branch-accounting/',
    destination: '/solutions/transport-accounting/',
    permanent: true,
  },
  {
    source: '/features/gst-eway-bill-integration',
    destination: '/solutions/e-way-bill-management/',
    permanent: true,
  },
  {
    source: '/features/gst-eway-bill-integration/',
    destination: '/solutions/e-way-bill-management/',
    permanent: true,
  },
  {
    source: '/features/fleet-and-driver-tracking',
    destination: '/solutions/fleet-management/',
    permanent: true,
  },
  {
    source: '/features/fleet-and-driver-tracking/',
    destination: '/solutions/fleet-management/',
    permanent: true,
  },
  {
    source: '/features/driver-kyc-software',
    destination: '/solutions/driver-management/',
    permanent: true,
  },
  {
    source: '/features/driver-kyc-software/',
    destination: '/solutions/driver-management/',
    permanent: true,
  },

  // Legacy Industry & Content redirects
  {
    source: '/industries/ftl-ptl-transporters',
    destination: '/industries/',
    permanent: true,
  },
  {
    source: '/industries/ftl-ptl-transporters/',
    destination: '/industries/',
    permanent: true,
  },
  {
    source: '/industries/full-truckload-ftl',
    destination: '/industries/ftl-transporters/',
    permanent: true,
  },
  {
    source: '/industries/full-truckload-ftl/',
    destination: '/industries/ftl-transporters/',
    permanent: true,
  },
  {
    source: '/industries/part-truckload-ptl',
    destination: '/industries/ptl-transporters/',
    permanent: true,
  },
  {
    source: '/industries/part-truckload-ptl/',
    destination: '/industries/ptl-transporters/',
    permanent: true,
  },
  { source: '/blog', destination: '/solutions/', permanent: false },
  { source: '/blog/', destination: '/solutions/', permanent: false },
  { source: '/refund', destination: '/terms/', permanent: false },
  { source: '/refund/', destination: '/terms/', permanent: false },
];

/**
 * Helper used in middleware for canonical trailing slashes ONLY on public routes
 * (keeps `/admin/*`, `/api/*`, and `/track*` completely untouched).
 */
export function isPublicMarketingPath(pathname: string): boolean {
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/track') ||
    pathname.startsWith('/login')
  ) {
    return false;
  }
  // Ignore static files with file extensions (.png, .svg, .xml, .txt, .webp, etc.)
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
    return false;
  }
  return pathname !== '/';
}
