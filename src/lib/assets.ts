/**
 * Centralized registry of ALL visual assets across the public marketing website.
 *
 * HOW TO REPLACE AN ASSET:
 * 1. Add your optimized WebP / PNG / AVIF image inside `/public/images/...` (or `/public/truck.webp`).
 * 2. Update the `src`, `width`, `height`, and descriptive `alt` below.
 * 3. Any slot with `src: null` automatically renders a branded teal gradient placeholder
 *    with a dashed label in development and a clean architectural surface in production.
 *
 * CRITICAL RULE: No unverified stock claims; only real product screenshots belong in solution slots.
 */

export interface AssetSlot {
  id: string;
  src: string | null;
  alt: string;
  label: string;
  recommendedSize: string;
  width: number;
  height: number;
  aspectClass: string;
}

export const ASSETS = {
  brand: {
    logo: {
      id: 'brand-logo',
      src: '/main_logo.svg',
      alt: 'Trust Logistic — Transport Management Software Logo',
      label: 'Primary Horizontal Logo',
      recommendedSize: '520x120 PNG/SVG',
      width: 1185,
      height: 312,
      aspectClass: 'aspect-[38/10]',
    },
    logoSvg: '/main_logo.svg',
    iconSvg: '/logo_icon.svg',
    ogDefault: {
      id: 'og-default',
      src: '/opengraph-image',
      alt: 'Trust Logistic — Transport Management Software for India',
      label: 'Open Graph Social Card',
      recommendedSize: '1200x630 PNG/WebP',
      width: 1200,
      height: 630,
      aspectClass: 'aspect-[1200/630]',
    },
  },
  hero: {
    /**
     * `<Truck />` checks `/public/truck.webp` (transparent side-view truck facing LEFT).
     * When null / absent on disk, `<Truck />` falls back to our precision inline SVG truck
     * with physically synchronized rotating wheels.
     */
    truck: {
      id: 'hero-truck',
      src: '/truck.webp',
      alt: 'Commercial highway freight truck illustration moving across India',
      label: 'Hero Side-View Truck (Facing Left, Transparent)',
      recommendedSize: '1400x620 transparent WebP',
      width: 1400,
      height: 620,
      aspectClass: 'aspect-[16/7]',
    },
    sitePhoto: {
      id: 'home-site-photo',
      src: '/site-photo.jpg',
      alt: 'Indian transport fleet trucks parked at sunrise — Trust Logistic freight yard',
      label: 'Full-Bleed Transport Yard / Highway Fleet Photo',
      recommendedSize: '1920x1080 WebP/AVIF',
      width: 1920,
      height: 1080,
      aspectClass: 'aspect-video',
    } satisfies AssetSlot,
    dockPhoto: {
      id: 'home-dock-photo',
      src: null,
      alt: 'Transport booking counter and freight loading dock operations',
      label: 'Full-Bleed Loading Dock & Consignment Photo',
      recommendedSize: '1920x1080 WebP/AVIF',
      width: 1920,
      height: 1080,
      aspectClass: 'aspect-video',
    } satisfies AssetSlot,
  },
  solutions: {
    'transport-management-software': {
      id: 'solution-tms',
      src: null,
      alt: 'Trust Logistic Transport Management Software unified branch dashboard screenshot',
      label: 'Real Product Screenshot: TMS Overview Dashboard',
      recommendedSize: '1440x900 PNG/WebP',
      width: 1440,
      height: 900,
      aspectClass: 'aspect-[16/10]',
    },
    'lr-bilty-management': {
      id: 'solution-lr',
      src: null,
      alt: 'Digital Lorry Receipt (LR / Bilty), Lorry Challan and Crossing Memo screen',
      label: 'Real Product Screenshot: LR / Bilty & Challan Entry',
      recommendedSize: '1440x900 PNG/WebP',
      width: 1440,
      height: 900,
      aspectClass: 'aspect-[16/10]',
    },
    'transport-billing-invoicing': {
      id: 'solution-billing',
      src: null,
      alt: 'Automated Freight Billing and TBB Client Invoicing screen',
      label: 'Real Product Screenshot: Freight Billing & Invoices',
      recommendedSize: '1440x900 PNG/WebP',
      width: 1440,
      height: 900,
      aspectClass: 'aspect-[16/10]',
    },
    'transport-accounting': {
      id: 'solution-accounting',
      src: null,
      alt: 'Branch Cash Ledger, Expenses and Lorry Hire Settlement screen',
      label: 'Real Product Screenshot: Transport Accounting & Ledgers',
      recommendedSize: '1440x900 PNG/WebP',
      width: 1440,
      height: 900,
      aspectClass: 'aspect-[16/10]',
    },
    'e-way-bill-management': {
      id: 'solution-ewaybill',
      src: null,
      alt: 'GSP E-Way Bill and Consolidated E-Way Bill generation screen',
      label: 'Real Product Screenshot: GSP E-Way Bill Module',
      recommendedSize: '1440x900 PNG/WebP',
      width: 1440,
      height: 900,
      aspectClass: 'aspect-[16/10]',
    },
    'fleet-management': {
      id: 'solution-fleet',
      src: null,
      alt: 'Vehicle Fleet Registry, Lorry Hire and Trip Tracking screen',
      label: 'Real Product Screenshot: Fleet Management',
      recommendedSize: '1440x900 PNG/WebP',
      width: 1440,
      height: 900,
      aspectClass: 'aspect-[16/10]',
    },
    'driver-management': {
      id: 'solution-driver',
      src: null,
      alt: 'Driver Registry, License Records and Advance Ledger screen',
      label: 'Real Product Screenshot: Driver Management',
      recommendedSize: '1440x900 PNG/WebP',
      width: 1440,
      height: 900,
      aspectClass: 'aspect-[16/10]',
    },
    'reports-analytics': {
      id: 'solution-reports',
      src: null,
      alt: 'Daily Booking, Challan Memo and Invoice Summary Reports screen',
      label: 'Real Product Screenshot: Transport Reports',
      recommendedSize: '1440x900 PNG/WebP',
      width: 1440,
      height: 900,
      aspectClass: 'aspect-[16/10]',
    },
  } satisfies Record<string, AssetSlot>,
  leadership: {
    placeholderPortrait: {
      id: 'leadership-portrait-slot',
      src: null,
      alt: 'Approved Trust Logistic leadership portrait',
      label: 'Approved Leadership Portrait',
      recommendedSize: '800x800 WebP',
      width: 800,
      height: 800,
      aspectClass: 'aspect-square',
    } satisfies AssetSlot,
  },
  caseStudies: {
    placeholderCover: {
      id: 'case-study-cover-slot',
      src: null,
      alt: 'Approved Trust Logistic implementation cover image',
      label: 'Approved Case Study Photo',
      recommendedSize: '1200x750 WebP',
      width: 1200,
      height: 750,
      aspectClass: 'aspect-[16/10]',
    } satisfies AssetSlot,
  },
};
