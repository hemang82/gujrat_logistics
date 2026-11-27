import type { Metadata } from 'next';
import { ASSETS } from './assets';
import { COMPANY } from './company';
import { getPageConfig, normalizePath, type BreadcrumbItem } from './sitemap';

export function buildAbsoluteUrl(path: string): string {
  const norm = normalizePath(path);
  return `${COMPANY.domain}${norm === '/' ? '/' : norm}`;
}

interface BuildPageMetadataOptions {
  path: string;
  title?: string;
  description?: string;
  keywords?: string[];
  ogType?: 'website' | 'article';
  forceNoIndex?: boolean;
}

/**
 * Generates compliant Next.js Metadata from `/lib/sitemap.ts`.
 * Enforces:
 * - Unique title <= 60 chars (via absolute title so root template never bloats it)
 * - Description <= 160 chars
 * - Trailing-slash canonical URL
 * - Automatic `noindex, nofollow` on draft or non-sitemap pages
 */
export function buildPageMetadata({
  path,
  title,
  description,
  keywords,
  ogType = 'website',
  forceNoIndex,
}: BuildPageMetadataOptions): Metadata {
  const node = getPageConfig(path);
  const rawTitle = title || node?.title || 'Trust Logistic';
  const safeTitle = rawTitle.length > 60 ? `${rawTitle.slice(0, 57)}...` : rawTitle;
  const rawDesc =
    description ||
    node?.description ||
    'Transport management software for Indian transporters, fleet owners and brokers.';
  const safeDesc = rawDesc.length > 160 ? `${rawDesc.slice(0, 157)}...` : rawDesc;

  const isDraftOrExcluded =
    forceNoIndex || (node ? node.status === 'draft' || !node.inSitemap : false);
  const canonicalUrl = buildAbsoluteUrl(path);
  const ogImage = `${COMPANY.domain}${ASSETS.brand.ogDefault.src}`;

  return {
    title: { absolute: safeTitle },
    description: safeDesc,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: isDraftOrExcluded
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: {
      type: ogType,
      locale: COMPANY.locale,
      url: canonicalUrl,
      title: safeTitle,
      description: safeDesc,
      siteName: COMPANY.brandName,
      images: [
        {
          url: ogImage,
          width: ASSETS.brand.ogDefault.width,
          height: ASSETS.brand.ogDefault.height,
          alt: ASSETS.brand.ogDefault.alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: safeTitle,
      description: safeDesc,
      images: [ogImage],
    },
  };
}

// ================= JSON-LD SCHEMA GENERATORS =================

export function buildOrganizationSchema() {
  const sameAs = Object.values(COMPANY.social).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: COMPANY.brandName,
    url: COMPANY.domain,
    logo: `${COMPANY.domain}${ASSETS.brand.logo.src}`,
    description:
      'Transport management software for Indian transporters, fleet owners and transport brokers covering LR / Bilty, Lorry Challan, Crossing Memo, Lorry Hire, GSP E-Way Bill, fleet, drivers and freight billing.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ahmedabad',
      addressRegion: 'GJ',
      postalCode: '382405',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: COMPANY.contact.phoneDisplay,
      email: COMPANY.contact.primaryEmail,
      contactType: 'sales',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi', 'Gujarati'],
    },
    sameAs,
  };
}

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: COMPANY.brandName,
    url: COMPANY.domain,
    description: COMPANY.tagline,
    inLanguage: COMPANY.lang,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${COMPANY.domain}/track?lr={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.label,
      item: buildAbsoluteUrl(item.href),
    })),
  };
}

export function buildSoftwareApplicationSchema({
  name,
  description,
  path,
  featureList,
}: {
  name: string;
  description: string;
  path: string;
  featureList: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: buildAbsoluteUrl(path),
    description,
    featureList,
    provider: {
      '@type': 'Organization',
      name: COMPANY.brandName,
      url: COMPANY.domain,
    },
  };
}

export function buildFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function buildArticleSchema({
  title,
  description,
  path,
  publishedAt,
  updatedAt,
}: {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  updatedAt?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    mainEntityOfPage: buildAbsoluteUrl(path),
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    publisher: {
      '@type': 'Organization',
      name: COMPANY.brandName,
      logo: {
        '@type': 'ImageObject',
        url: `${COMPANY.domain}${ASSETS.brand.logo.src}`,
      },
    },
  };
}
