import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isPublicMarketingPath } from '@/lib/redirects';

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 1. Existing Admin & Authenticated Root Handling (100% preserved)
  const isAuthPage = pathname.startsWith('/admin/login');
  const isAdminRoute = pathname.startsWith('/admin');
  const isHomePage = pathname === '/';

  if (isHomePage || isAdminRoute) {
    const token = await getToken({
      req,
      secret:
        process.env.NEXTAUTH_SECRET || 'default_secret_for_development_only',
    });
    const isAuth = !!token;

    if (isHomePage && isAuth) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
      return NextResponse.next();
    }

    if (!isAuth && isAdminRoute) {
      let from = pathname;
      if (search) {
        from += search;
      }

      return NextResponse.redirect(
        new URL(`/admin/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    return NextResponse.next();
  }

  // 2. Enforce trailing slashes ONLY on public marketing pages (not /api, /admin, /track, /login, static files)
  if (isPublicMarketingPath(pathname) && !pathname.endsWith('/')) {
    const target = `${req.nextUrl.origin}${pathname}/${search}`;
    return NextResponse.redirect(target, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|xml|txt|css|js|map)$).*)',
  ],
};
