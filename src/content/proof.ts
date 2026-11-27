/**
 * Verified social proof & customer outcomes repository.
 *
 * CRITICAL CONTENT RULE:
 * Never invent clients, logos, testimonials, case studies, or metrics.
 * Leave these arrays empty until written client permission and real figures are provided.
 *
 * Behavior:
 * - On Homepage Section 7 (Proof): If all arrays below are empty, the Proof section
 *   is omitted in production and shows a dev-only placeholder prompt in development.
 * - On Phase 2 pages (/projects/, /case-studies/, /testimonials/): pages stay in
 *   `status: "draft"` (noindex + excluded from sitemap) until real items are added here
 *   and statuses are flipped to "live" in `/lib/sitemap.ts`.
 */

export interface ApprovedLogo {
  id: string;
  companyName: string;
  city: string;
  logoSrc: string;
  alt: string;
}

export interface ApprovedTestimonial {
  id: string;
  quote: string;
  personName: string;
  role: string;
  companyName: string;
  city: string;
}

export interface ApprovedCaseStudy {
  slug: string;
  title: string;
  clientName: string;
  segment: string;
  location: string;
  summary: string;
  context: string;
  challenge: string;
  implementation: string;
  verifiedOutcomes: string[];
  quote?: string;
  relatedSolutionSlug: string;
}

export interface ApprovedHeroMetric {
  label: string;
  value: string;
  detail: string;
}

/**
 * Approved Hero metrics. Keep empty unless real, verifiable telemetry is supplied.
 * When empty, Hero renders factual confirmed platform pillars on the left column
 * in production and indicates the slot in development.
 */
export const APPROVED_HERO_METRICS: ApprovedHeroMetric[] = [];

export const APPROVED_LOGOS: ApprovedLogo[] = [];

export const APPROVED_TESTIMONIALS: ApprovedTestimonial[] = [];

export const APPROVED_CASE_STUDIES: ApprovedCaseStudy[] = [];

export interface LeadershipProfile {
  slug: string;
  name: string;
  role: string;
  bio: string;
  experience: string[];
  linkedinUrl?: string;
  photoSrc?: string | null;
}

export const APPROVED_LEADERSHIP: LeadershipProfile[] = [];

export interface CareerOpening {
  slug: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
}

export const ACTIVE_CAREER_OPENINGS: CareerOpening[] = [];

export function hasApprovedProof(): boolean {
  return (
    APPROVED_LOGOS.length > 0 ||
    APPROVED_TESTIMONIALS.length > 0 ||
    APPROVED_CASE_STUDIES.length > 0
  );
}
