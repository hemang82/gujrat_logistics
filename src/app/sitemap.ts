import type { MetadataRoute } from 'next';
import { getLiveSitemapEntries } from '@/lib/sitemap';
import { getAllInsights } from '@/lib/insights';
import { buildAbsoluteUrl } from '@/lib/seo';

/**
 * Dynamically generated from `/lib/sitemap.ts` + live `/insights/` articles.
 * Includes ONLY `status: "live"` + `inSitemap: true` pages.
 * Draft Phase 2 and Phase 3 pages are automatically excluded until flipped to "live".
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries = getLiveSitemapEntries();
  const insights = getAllInsights();
  const now = new Date();

  const staticAndCatalogUrls: MetadataRoute.Sitemap = entries.map((node) => ({
    url: buildAbsoluteUrl(node.path),
    lastModified: now,
    changeFrequency: node.changeFrequency || 'monthly',
    priority: node.priority ?? 0.7,
  }));

  const insightUrls: MetadataRoute.Sitemap = insights.map((art) => ({
    url: buildAbsoluteUrl(`/insights/${art.slug}/`),
    lastModified: new Date(art.frontmatter.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  const trackUrl: MetadataRoute.Sitemap = [
    {
      url: 'https://trustlogistic.in/track',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  return [...staticAndCatalogUrls, ...insightUrls, ...trackUrl];
}
