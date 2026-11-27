/**
 * SINGLE SOURCE OF TRUTH FOR TRUST LOGISTIC WEBSITE ARCHITECTURE
 * Strictly follows `Trust_Logistic_Complete_Website_Sitemap.pdf`.
 *
 * Rules:
 * - Every marketing route ends with "/".
 * - Draft pages (Phase 2 & 3, status: "draft") are excluded from XML sitemap,
 *   excluded from public navigation, and output `noindex, nofollow`.
 * - Flipping `status` from "draft" -> "live" and `inSitemap: true` automatically
 *   publishes the route in navigation, breadcrumbs, and `/sitemap.xml`.
 */

export type LaunchPhase = 1 | 2 | 3;
export type PageStatus = 'live' | 'draft';

export type PageTemplate =
  | 'home'
  | 'solutions-overview'
  | 'solution-detail'
  | 'industries-overview'
  | 'industry-detail'
  | 'company-hub'
  | 'about'
  | 'leadership'
  | 'leadership-profile'
  | 'careers'
  | 'job-detail'
  | 'contact'
  | 'pricing'
  | 'demo'
  | 'thank-you'
  | 'legal'
  | 'projects-overview'
  | 'project-detail'
  | 'case-studies-overview'
  | 'case-study-detail'
  | 'testimonials'
  | 'implementation'
  | 'resources-hub'
  | 'insights-list'
  | 'insight-article'
  | 'faqs'
  | 'guide'
  | 'trust-security';

export type NavGroup =
  | 'primary'
  | 'mega-solutions-core'
  | 'mega-solutions-operations'
  | 'mega-industries'
  | 'mega-company'
  | 'mega-projects'
  | 'mega-resources'
  | 'footer-solutions'
  | 'footer-industries'
  | 'footer-company'
  | 'footer-resources'
  | 'footer-legal';

export interface SitemapNode {
  path: string;
  title: string;
  navLabel: string;
  description: string;
  parent: string | null;
  phase: LaunchPhase;
  status: PageStatus;
  template: PageTemplate;
  inSitemap: boolean;
  isDynamic?: boolean;
  navGroups?: NavGroup[];
  priority?: number;
  changeFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export const SITE_MAP: SitemapNode[] = [
  // ================= PHASE 1 (LIVE) =================
  {
    path: '/',
    title: 'Transport Management Software for FTL & PTL | Trust Logistic',
    navLabel: 'Home',
    description:
      'Transport software for Indian transporters: LR, challan, e-way bill, fleet, billing and accounts for FTL & PTL operations. Request a free demo.',
    parent: null,
    phase: 1,
    status: 'live',
    template: 'home',
    inSitemap: true,
    navGroups: ['primary'],
    priority: 1.0,
    changeFrequency: 'weekly',
  },
  {
    path: '/solutions/',
    title: 'Transport Software Modules & Features | Trust Logistic',
    navLabel: 'Solutions',
    description:
      'Explore confirmed Trust Logistic modules: LR / Bilty, Lorry Challan, Crossing Memo, Lorry Hire, Delivery, Fleet, Drivers, Accounts, Billing and E-Way Bills.',
    parent: '/',
    phase: 1,
    status: 'live',
    template: 'solutions-overview',
    inSitemap: true,
    navGroups: ['primary', 'footer-solutions'],
    priority: 0.9,
    changeFrequency: 'weekly',
  },
  {
    path: '/solutions/transport-management-software/',
    title: 'Transport Management Software (TMS) | Trust Logistic',
    navLabel: 'Transport Management Software',
    description:
      'End-to-end Transport Management System built for Indian booking counters, multi-branch operators and fleet networks.',
    parent: '/solutions/',
    phase: 1,
    status: 'live',
    template: 'solution-detail',
    inSitemap: true,
    navGroups: ['mega-solutions-core', 'footer-solutions'],
    priority: 0.9,
    changeFrequency: 'monthly',
  },
  {
    path: '/solutions/lr-bilty-management/',
    title: 'LR & Bilty Management Software | Trust Logistic',
    navLabel: 'LR / Bilty Management',
    description:
      'Create digital Lorry Receipts (LR / Bilty), dispatch Lorry Challans, Crossing Memos and Lorry Hire slips from one connected workflow.',
    parent: '/solutions/',
    phase: 1,
    status: 'live',
    template: 'solution-detail',
    inSitemap: true,
    navGroups: ['mega-solutions-core', 'footer-solutions'],
    priority: 0.9,
    changeFrequency: 'monthly',
  },
  {
    path: '/solutions/e-way-bill-management/',
    title: 'E-Way Bill Software via GSP Integration | Trust Logistic',
    navLabel: 'E-Way Bill Management',
    description:
      'Generate Part-A, Part-B and Consolidated E-Way Bills directly from LR and Challan records through GSP integration.',
    parent: '/solutions/',
    phase: 1,
    status: 'live',
    template: 'solution-detail',
    inSitemap: true,
    navGroups: ['mega-solutions-core', 'footer-solutions'],
    priority: 0.85,
    changeFrequency: 'monthly',
  },
  {
    path: '/solutions/transport-billing-invoicing/',
    title: 'Transport Billing & Freight Invoicing | Trust Logistic',
    navLabel: 'Billing & Invoicing',
    description:
      'Generate Paid, To-Pay and TBB freight bills, monthly party invoices and billing summaries directly from confirmed LR data.',
    parent: '/solutions/',
    phase: 1,
    status: 'live',
    template: 'solution-detail',
    inSitemap: true,
    navGroups: ['mega-solutions-core', 'footer-solutions'],
    priority: 0.85,
    changeFrequency: 'monthly',
  },
  {
    path: '/solutions/transport-accounting/',
    title: 'Transport Accounting & Branch Ledgers | Trust Logistic',
    navLabel: 'Transport Accounting',
    description:
      'Manage branch cash books, client ledgers, trip expenses, driver balances and Lorry Hire settlements with clear audit trails.',
    parent: '/solutions/',
    phase: 1,
    status: 'live',
    template: 'solution-detail',
    inSitemap: true,
    navGroups: ['mega-solutions-operations', 'footer-solutions'],
    priority: 0.85,
    changeFrequency: 'monthly',
  },
  {
    path: '/solutions/fleet-management/',
    title: 'Fleet & Lorry Hire Management | Trust Logistic',
    navLabel: 'Fleet Management',
    description:
      'Track owned and hired trucks, vehicle document records, trip assignments and lorry hire balances in one register.',
    parent: '/solutions/',
    phase: 1,
    status: 'live',
    template: 'solution-detail',
    inSitemap: true,
    navGroups: ['mega-solutions-operations', 'footer-solutions'],
    priority: 0.8,
    changeFrequency: 'monthly',
  },
  {
    path: '/solutions/driver-management/',
    title: 'Driver Management & Advance Ledgers | Trust Logistic',
    navLabel: 'Driver Management',
    description:
      'Maintain driver profiles, license numbers, trip assignments and transparent driver cash advance and settlement accounts.',
    parent: '/solutions/',
    phase: 1,
    status: 'live',
    template: 'solution-detail',
    inSitemap: true,
    navGroups: ['mega-solutions-operations', 'footer-solutions'],
    priority: 0.8,
    changeFrequency: 'monthly',
  },
  {
    path: '/solutions/reports-analytics/',
    title: 'Transport Reports & Business Registers | Trust Logistic',
    navLabel: 'Reports & Analytics',
    description:
      'Export daily booking registers, pending delivery reports, memo summaries, invoices and lorry hire statements.',
    parent: '/solutions/',
    phase: 1,
    status: 'live',
    template: 'solution-detail',
    inSitemap: true,
    navGroups: ['mega-solutions-operations', 'footer-solutions'],
    priority: 0.8,
    changeFrequency: 'monthly',
  },
  {
    path: '/industries/',
    title: 'Industries Served | Trust Logistic',
    navLabel: 'Industries',
    description:
      'See how Trust Logistic adapts to transport companies, fleet owners and transport brokers across Indian freight corridors.',
    parent: '/',
    phase: 1,
    status: 'live',
    template: 'industries-overview',
    inSitemap: true,
    navGroups: ['primary', 'footer-industries'],
    priority: 0.85,
    changeFrequency: 'monthly',
  },
  {
    path: '/industries/transport-companies/',
    title: 'Software for Transport Companies | Trust Logistic',
    navLabel: 'Transport Companies',
    description:
      'Built for parcel and booking transport companies handling daily LRs, Lorry Challans, Crossing Memos, deliveries and branch cash.',
    parent: '/industries/',
    phase: 1,
    status: 'live',
    template: 'industry-detail',
    inSitemap: true,
    navGroups: ['mega-industries', 'footer-industries'],
    priority: 0.85,
    changeFrequency: 'monthly',
  },
  {
    path: '/industries/fleet-owners/',
    title: 'Software for Fleet Owners | Trust Logistic',
    navLabel: 'Fleet Owners',
    description:
      'Control vehicle utilization, driver settlements, trip expenses, E-Way Bills and client freight billing for owned fleets.',
    parent: '/industries/',
    phase: 1,
    status: 'live',
    template: 'industry-detail',
    inSitemap: true,
    navGroups: ['mega-industries', 'footer-industries'],
    priority: 0.85,
    changeFrequency: 'monthly',
  },
  {
    path: '/industries/transport-brokers/',
    title: 'Software for Transport Brokers | Trust Logistic',
    navLabel: 'Transport Brokers',
    description:
      'Manage hired vehicles, Lorry Hire contracts, advance-to-balance payouts, client billing and crossing memos cleanly.',
    parent: '/industries/',
    phase: 1,
    status: 'live',
    template: 'industry-detail',
    inSitemap: true,
    navGroups: ['mega-industries', 'footer-industries'],
    priority: 0.85,
    changeFrequency: 'monthly',
  },
  {
    path: '/company/about-us/',
    title: 'About Us | Trust Logistic',
    navLabel: 'About Us',
    description:
      'Learn why Trust Logistic builds practical, dependable transport management software tailored for Indian logistics workflows.',
    parent: '/company/',
    phase: 1,
    status: 'live',
    template: 'about',
    inSitemap: true,
    navGroups: ['mega-company', 'footer-company'],
    priority: 0.7,
    changeFrequency: 'monthly',
  },
  {
    path: '/company/contact/',
    title: 'Contact & Support | Trust Logistic',
    navLabel: 'Contact Us',
    description:
      'Reach Trust Logistic for sales enquiries, product walkthroughs and customer support across India.',
    parent: '/company/',
    phase: 1,
    status: 'live',
    template: 'contact',
    inSitemap: true,
    navGroups: ['mega-company', 'footer-company'],
    priority: 0.75,
    changeFrequency: 'monthly',
  },
  {
    path: '/pricing/',
    title: 'Pricing & Plans | Trust Logistic',
    navLabel: 'Pricing',
    description:
      'Explore Trust Logistic deployment options and plan structure. Contact us for tailored pricing based on your branches and operational scope.',
    parent: '/',
    phase: 1,
    status: 'live',
    template: 'pricing',
    inSitemap: true,
    navGroups: ['primary', 'footer-company'],
    priority: 0.85,
    changeFrequency: 'monthly',
  },
  {
    path: '/request-a-demo/',
    title: 'Request a Demo | Trust Logistic',
    navLabel: 'Request a Demo',
    description:
      'Schedule a live walkthrough of Trust Logistic with our product team. See LR booking, challans, E-Way Bills and branch accounts in action.',
    parent: '/',
    phase: 1,
    status: 'live',
    template: 'demo',
    inSitemap: true,
    navGroups: ['footer-company'],
    priority: 0.9,
    changeFrequency: 'monthly',
  },
  {
    path: '/request-a-demo/thank-you/',
    title: 'Demo Request Received | Trust Logistic',
    navLabel: 'Demo Confirmation',
    description: 'Confirmation page for your Trust Logistic software demo request.',
    parent: '/request-a-demo/',
    phase: 1,
    status: 'live',
    template: 'thank-you',
    inSitemap: false,
    priority: 0.1,
    changeFrequency: 'yearly',
  },
  {
    path: '/privacy-policy/',
    title: 'Privacy Policy | Trust Logistic',
    navLabel: 'Privacy Policy',
    description:
      'Read how Trust Logistic collects, processes and protects operational consignment, billing, E-Way Bill and account information.',
    parent: '/',
    phase: 1,
    status: 'live',
    template: 'legal',
    inSitemap: true,
    navGroups: ['footer-legal'],
    priority: 0.3,
    changeFrequency: 'yearly',
  },
  {
    path: '/terms/',
    title: 'Terms & Conditions | Trust Logistic',
    navLabel: 'Terms & Conditions',
    description: 'Terms and conditions governing use of the Trust Logistic platform and website.',
    parent: '/',
    phase: 1,
    status: 'live',
    template: 'legal',
    inSitemap: true,
    navGroups: ['footer-legal'],
    priority: 0.3,
    changeFrequency: 'yearly',
  },

  // ================= PHASE 2 (SCAFFOLDED - DRAFT) =================
  {
    path: '/projects/',
    title: 'Projects & Success Stories | Trust Logistic',
    navLabel: 'Projects & Success Stories',
    description: 'Verified transport software implementations, case studies and customer outcomes.',
    parent: '/',
    phase: 2,
    status: 'draft',
    template: 'projects-overview',
    inSitemap: false,
    navGroups: ['primary', 'mega-projects'],
  },
  {
    path: '/projects/[project-name]/',
    title: 'Implementation Project | Trust Logistic',
    navLabel: 'Project Detail',
    description: 'Verified implementation details for Trust Logistic.',
    parent: '/projects/',
    phase: 2,
    status: 'draft',
    template: 'project-detail',
    inSitemap: false,
    isDynamic: true,
  },
  {
    path: '/case-studies/',
    title: 'Case Studies | Trust Logistic',
    navLabel: 'Case Studies',
    description: 'Approved customer stories and measurable logistics workflow improvements.',
    parent: '/projects/',
    phase: 2,
    status: 'draft',
    template: 'case-studies-overview',
    inSitemap: false,
    navGroups: ['mega-projects'],
  },
  {
    path: '/case-studies/[customer-story]/',
    title: 'Customer Case Study | Trust Logistic',
    navLabel: 'Case Study',
    description: 'Verified customer case study on Trust Logistic.',
    parent: '/case-studies/',
    phase: 2,
    status: 'draft',
    template: 'case-study-detail',
    inSitemap: false,
    isDynamic: true,
  },
  {
    path: '/testimonials/',
    title: 'Client Testimonials | Trust Logistic',
    navLabel: 'Testimonials',
    description: 'Approved client feedback from Indian transport businesses.',
    parent: '/projects/',
    phase: 2,
    status: 'draft',
    template: 'testimonials',
    inSitemap: false,
    navGroups: ['mega-projects'],
  },
  {
    path: '/implementation-approach/',
    title: 'Implementation Approach | Trust Logistic',
    navLabel: 'Implementation Approach',
    description: 'How Trust Logistic onboards multi-branch transporters and migrates data.',
    parent: '/projects/',
    phase: 2,
    status: 'draft',
    template: 'implementation',
    inSitemap: false,
    navGroups: ['mega-projects'],
  },
  {
    path: '/resources/',
    title: 'Resources Hub | Trust Logistic',
    navLabel: 'Resources',
    description: 'Insights, guides, tutorials and FAQs for transport operators across India.',
    parent: '/',
    phase: 2,
    status: 'draft',
    template: 'resources-hub',
    inSitemap: false,
    navGroups: ['primary', 'mega-resources', 'footer-resources'],
  },
  {
    path: '/resources/faqs/',
    title: 'Frequently Asked Questions | Trust Logistic',
    navLabel: 'FAQs',
    description: 'Detailed answers about Trust Logistic modules, onboarding and daily use.',
    parent: '/resources/',
    phase: 2,
    status: 'draft',
    template: 'faqs',
    inSitemap: false,
    navGroups: ['mega-resources', 'footer-resources'],
  },
  {
    path: '/company/',
    title: 'Company Overview | Trust Logistic',
    navLabel: 'Company',
    description: 'About Trust Logistic, leadership, careers and contact channels.',
    parent: '/',
    phase: 2,
    status: 'draft',
    template: 'company-hub',
    inSitemap: false,
    navGroups: ['primary', 'footer-company'],
  },
  {
    path: '/company/leadership/',
    title: 'Leadership Team | Trust Logistic',
    navLabel: 'Leadership',
    description: 'Approved profiles of the leadership team behind Trust Logistic.',
    parent: '/company/',
    phase: 2,
    status: 'draft',
    template: 'leadership',
    inSitemap: false,
    navGroups: ['mega-company'],
  },
  {
    path: '/company/leadership/[name]/',
    title: 'Leadership Profile | Trust Logistic',
    navLabel: 'Leader Profile',
    description: 'Leadership team member profile at Trust Logistic.',
    parent: '/company/leadership/',
    phase: 2,
    status: 'draft',
    template: 'leadership-profile',
    inSitemap: false,
    isDynamic: true,
  },
  {
    path: '/company/careers/',
    title: 'Careers at Trust Logistic',
    navLabel: 'Careers',
    description: 'Active job openings and life at Trust Logistic.',
    parent: '/company/',
    phase: 2,
    status: 'draft',
    template: 'careers',
    inSitemap: false,
    navGroups: ['mega-company'],
  },
  {
    path: '/company/careers/[role]/',
    title: 'Job Role | Trust Logistic Careers',
    navLabel: 'Role Detail',
    description: 'Open position details at Trust Logistic.',
    parent: '/company/careers/',
    phase: 2,
    status: 'draft',
    template: 'job-detail',
    inSitemap: false,
    isDynamic: true,
  },
  {
    path: '/security-data-protection/',
    title: 'Security & Data Protection | Trust Logistic',
    navLabel: 'Security & Data Protection',
    description: 'Documented data protection and access controls at Trust Logistic.',
    parent: '/company/',
    phase: 2,
    status: 'draft',
    template: 'trust-security',
    inSitemap: false,
    navGroups: ['footer-legal'],
  },
  {
    path: '/sla/',
    title: 'Service Availability & SLA | Trust Logistic',
    navLabel: 'Service SLA',
    description: 'Service availability commitments for Trust Logistic.',
    parent: '/company/',
    phase: 2,
    status: 'draft',
    template: 'trust-security',
    inSitemap: false,
    navGroups: ['footer-legal'],
  },

  // ================= PHASE 3 (SCAFFOLDED - DRAFT) =================
  {
    path: '/insights/',
    title: 'Transport & Logistics Guides & Insights | Trust Logistic',
    navLabel: 'Insights',
    description:
      'Practical guides on digital LR / Bilty, FTL & PTL dispatch, Consolidated E-Way Bills (CEWB), TBB freight billing and lorry hire settlements.',
    parent: '/resources/',
    phase: 3,
    status: 'live',
    template: 'insights-list',
    inSitemap: true,
    navGroups: ['mega-resources', 'footer-resources'],
    priority: 0.8,
    changeFrequency: 'weekly',
  },
  {
    path: '/insights/[article-slug]/',
    title: 'Insight Article | Trust Logistic',
    navLabel: 'Article',
    description: 'Operational insight article from Trust Logistic.',
    parent: '/insights/',
    phase: 3,
    status: 'live',
    template: 'insight-article',
    inSitemap: true,
    isDynamic: true,
  },
  {
    path: '/resources/industry-guides/',
    title: 'Transport Industry Guides | Trust Logistic',
    navLabel: 'Industry Guides',
    description: 'Practical guides on Indian logistics documentation and freight rules.',
    parent: '/resources/',
    phase: 3,
    status: 'draft',
    template: 'guide',
    inSitemap: false,
    navGroups: ['mega-resources', 'footer-resources'],
  },
  {
    path: '/resources/tutorials/',
    title: 'Software Guides & Tutorials | Trust Logistic',
    navLabel: 'Tutorials',
    description: 'Step-by-step product walkthroughs for Trust Logistic modules.',
    parent: '/resources/',
    phase: 3,
    status: 'draft',
    template: 'guide',
    inSitemap: false,
    navGroups: ['mega-resources', 'footer-resources'],
  },
  {
    path: '/resources/help-centre/',
    title: 'Help Centre | Trust Logistic',
    navLabel: 'Help Centre',
    description: 'Knowledge base and operational documentation for Trust Logistic users.',
    parent: '/resources/',
    phase: 3,
    status: 'draft',
    template: 'guide',
    inSitemap: false,
    navGroups: ['footer-resources'],
  },
  {
    path: '/resources/product-updates/',
    title: 'Product Updates | Trust Logistic',
    navLabel: 'Product Updates',
    description: 'Release notes and platform improvements for Trust Logistic.',
    parent: '/resources/',
    phase: 3,
    status: 'draft',
    template: 'guide',
    inSitemap: false,
    navGroups: ['footer-resources'],
  },
  {
    path: '/solutions/branch-operations-management/',
    title: 'Branch & Operations Management | Trust Logistic',
    navLabel: 'Branch & Operations',
    description: 'Multi-branch operational controls, user permissions and dispatch workflows.',
    parent: '/solutions/',
    phase: 3,
    status: 'draft',
    template: 'solution-detail',
    inSitemap: false,
  },
  {
    path: '/solutions/integrations/',
    title: 'Integrations | Trust Logistic',
    navLabel: 'Integrations',
    description: 'Supported third-party and statutory integrations for Trust Logistic.',
    parent: '/solutions/',
    phase: 3,
    status: 'draft',
    template: 'solution-detail',
    inSitemap: false,
  },
  {
    path: '/industries/multi-branch-businesses/',
    title: 'Multi-Branch Transport Businesses | Trust Logistic',
    navLabel: 'Multi-Branch Businesses',
    description: 'Workflows for multi-hub and multi-branch transport operators.',
    parent: '/industries/',
    phase: 3,
    status: 'draft',
    template: 'industry-detail',
    inSitemap: false,
  },
  {
    path: '/industries/ftl-transporters/',
    title: 'FTL Transport Software | Trust Logistic',
    navLabel: 'FTL Transporters',
    description:
      'Manage full truckload bookings, lorry challans, lorry hire, e-way bills and freight billing in one system. Request a demo.',
    parent: '/industries/',
    phase: 1,
    status: 'live',
    template: 'industry-detail',
    inSitemap: true,
    navGroups: ['mega-industries', 'footer-industries'],
    priority: 0.85,
    changeFrequency: 'monthly',
  },
  {
    path: '/industries/ptl-transporters/',
    title: 'PTL Transport Software | Trust Logistic',
    navLabel: 'PTL Transporters',
    description:
      'Handle multiple LRs per vehicle, crossing memos, consolidated e-way bills and per-consignment billing. Request a demo.',
    parent: '/industries/',
    phase: 1,
    status: 'live',
    template: 'industry-detail',
    inSitemap: true,
    navGroups: ['mega-industries', 'footer-industries'],
    priority: 0.85,
    changeFrequency: 'monthly',
  },
  {
    path: '/industries/small-mid-size-businesses/',
    title: 'Small & Mid-Size Transport Businesses | Trust Logistic',
    navLabel: 'Small & Mid-Size',
    description: 'Practical TMS workflows for growing regional transport businesses.',
    parent: '/industries/',
    phase: 3,
    status: 'draft',
    template: 'industry-detail',
    inSitemap: false,
  },
  {
    path: '/cookie-policy/',
    title: 'Cookie Policy | Trust Logistic',
    navLabel: 'Cookie Policy',
    description: 'Cookie usage and preference disclosures for Trust Logistic.',
    parent: '/',
    phase: 3,
    status: 'draft',
    template: 'legal',
    inSitemap: false,
    navGroups: ['footer-legal'],
  },
  {
    path: '/refund-policy/',
    title: 'Refund & Cancellation Policy | Trust Logistic',
    navLabel: 'Refund Policy',
    description: 'Refund and subscription cancellation policy for Trust Logistic.',
    parent: '/',
    phase: 3,
    status: 'draft',
    template: 'legal',
    inSitemap: false,
    navGroups: ['footer-legal'],
  },
];

export function normalizePath(path: string): string {
  if (!path || path === '/') return '/';
  const cleaned = path.split('?')[0].split('#')[0];
  return cleaned.endsWith('/') ? cleaned : `${cleaned}/`;
}

export function getPageConfig(path: string): SitemapNode | undefined {
  const norm = normalizePath(path);
  return SITE_MAP.find((node) => node.path === norm);
}

export function isPageLive(path: string): boolean {
  const node = getPageConfig(path);
  return node?.status === 'live';
}

export function getLiveSitemapEntries(): SitemapNode[] {
  return SITE_MAP.filter(
    (node) => node.status === 'live' && node.inSitemap && !node.isDynamic
  );
}

export function getNavItemsByGroup(
  group: NavGroup,
  options: { includeDraft?: boolean } = {}
): SitemapNode[] {
  const includeDraft = options.includeDraft ?? false;
  return SITE_MAP.filter((node) => {
    const matchesGroup = node.navGroups?.includes(group);
    if (!matchesGroup) return false;
    if (node.isDynamic) return false;
    return includeDraft ? true : node.status === 'live';
  });
}

export interface BreadcrumbItem {
  label: string;
  href: string;
  isDraft?: boolean;
}

export function getBreadcrumbs(
  path: string,
  overrideCurrentLabel?: string
): BreadcrumbItem[] {
  const trail: BreadcrumbItem[] = [];
  let current = getPageConfig(path);

  // Fallback for dynamic pages
  if (!current) {
    const segments = normalizePath(path).split('/').filter(Boolean);
    if (segments.length >= 2) {
      const parentPath = `/${segments.slice(0, -1).join('/')}/`;
      const parentNode = getPageConfig(parentPath);
      if (overrideCurrentLabel) {
        trail.push({
          label: overrideCurrentLabel,
          href: normalizePath(path),
        });
      }
      current = parentNode;
    }
  } else if (overrideCurrentLabel) {
    trail.push({
      label: overrideCurrentLabel,
      href: current.path,
      isDraft: current.status === 'draft',
    });
    current = current.parent ? getPageConfig(current.parent) : undefined;
  }

  let safety = 0;
  while (current && safety < 10) {
    // Skip intermediate draft hubs in public breadcrumbs so visitors don't hit draft hub pages
    if (current.status === 'live' || current.path === '/' || current.path === normalizePath(path)) {
      trail.unshift({
        label: current.navLabel,
        href: current.path,
        isDraft: current.status === 'draft',
      });
    }
    current = current.parent ? getPageConfig(current.parent) : undefined;
    safety++;
  }

  if (trail.length === 0 || trail[0].href !== '/') {
    trail.unshift({ label: 'Home', href: '/' });
  }

  return trail;
}
