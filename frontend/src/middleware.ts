import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Routes that only unauthenticated users should access.
 * Authenticated users visiting these will be redirected to /.
 */
const GUEST_ONLY_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

/**
 * Routes that bypass ALL middleware logic.
 * Accessible to both authenticated and unauthenticated users.
 * /verify-email must be semi-public: both a logged-in unverified user
 * AND an unauthenticated user with a token link need to reach it.
 */
const SEMI_PUBLIC_ROUTES = [
  '/verify-email',
];

/**
 * Next.js Edge Middleware — GAP-1 fix.
 *
 * This file MUST be named `middleware.ts` and export a function named
 * `middleware` (or as a default export) to be picked up by Next.js.
 * A file named `proxy.ts` is silently ignored by the framework.
 *
 * Defense layers:
 *   1. This middleware  — edge-level, cookie-based, runs before any rendering
 *   2. ProtectedRoute   — client-side secondary guard after hydration
 *   3. API route guards — server-side, always verifies at the data source
 *
 * Cookie strategy:
 *   - `refreshToken`   — HttpOnly, set by the backend on login/register
 *   - `vami_session`   — readable JS cookie, set by the frontend auth API
 *   We check both as belt-and-suspenders since HttpOnly cookies can't be
 *   read by JS but can be detected by middleware via request.cookies.
 */
export function middleware(request: NextRequest) {
  const rawPathname = request.nextUrl.pathname;
  
  // Normalize pathname: strip trailing slash for exact matching
  const pathname = rawPathname.endsWith('/') && rawPathname.length > 1
    ? rawPathname.slice(0, -1)
    : rawPathname;

  // ── 1. Skip static assets, Next.js internals, and API routes ─────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('/favicon.ico') ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // ── 2. Semi-public routes: skip all middleware logic ──────────────────────
  const isSemiPublic = SEMI_PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isSemiPublic) {
    // Edge protection for verify-email: instantly redirect if no token is provided
    if (pathname === '/verify-email' && !request.nextUrl.searchParams.has('token')) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  const isGuestOnly = GUEST_ONLY_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const hasSession =
    request.cookies.has('refreshToken') ||
    request.cookies.has('vami_session');

  // ── 3. Protected route accessed without a session → send to login ─────────
  if (!isGuestOnly && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 4. Guest-only route accessed with a session → send to home ───────────
  if (isGuestOnly && hasSession) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
