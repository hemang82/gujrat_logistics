import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface InsightFrontmatter {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  readingTime: string;
  relatedSolution?: string;
}

export interface InsightArticle {
  slug: string;
  frontmatter: InsightFrontmatter;
  content: string;
}

const INSIGHTS_DIR = path.join(process.cwd(), 'src', 'content', 'insights');

export function getAllInsights(): InsightArticle[] {
  if (!fs.existsSync(INSIGHTS_DIR)) return [];
  const files = fs.readdirSync(INSIGHTS_DIR).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));

  return files
    .map((filename) => {
      const slug = filename.replace(/\.mdx?$/, '');
      const fullPath = path.join(INSIGHTS_DIR, filename);
      const raw = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(raw);
      return {
        slug,
        frontmatter: {
          title: String(data.title || slug),
          description: String(data.description || ''),
          publishedAt: String(data.publishedAt || '2026-11-01'),
          updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
          category: String(data.category || 'Operations'),
          readingTime: String(data.readingTime || '4 min read'),
          relatedSolution: data.relatedSolution ? String(data.relatedSolution) : undefined,
        },
        content,
      };
    })
    .sort((a, b) => (a.frontmatter.publishedAt < b.frontmatter.publishedAt ? 1 : -1));
}

export function getInsightBySlug(slug: string): InsightArticle | undefined {
  const all = getAllInsights();
  return all.find((article) => article.slug === slug);
}
