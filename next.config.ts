import type { NextConfig } from 'next';
import { LEGACY_REDIRECTS } from './src/lib/redirects';

const nextConfig: NextConfig = {
  /**
   * Keeps `/admin/*`, `/api/*` and NextAuth endpoints 100% free of automatic trailing-slash redirects,
   * while `src/middleware.ts` enforces trailing slashes cleanly on public marketing pages.
   */
  skipTrailingSlashRedirect: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return LEGACY_REDIRECTS.map((r) => ({
      source: r.source,
      destination: r.destination,
      permanent: r.permanent,
    }));
  },
};

export default nextConfig;
