import NextAuth from 'next-auth'
import authConfig from './auth.config'

const { auth } = NextAuth(authConfig)

const BYPASS_AUTH = process.env.BYPASS_AUTH === 'true';

// Routes that require authentication
const PROTECTED_PREFIXES = ['/portfolioManager', '/sendNues', '/reportSummarizer', '/patternRecognizer', '/settings'];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAuthPageRoute = nextUrl.pathname.startsWith('/login');
  const isApiRoute = nextUrl.pathname.startsWith('/api');

  if (isApiRoute) return;

  // Local dev escape hatch: skip all auth redirects.
  if (BYPASS_AUTH) return;

  // If on the login page and already logged in, redirect to portfolio manager
  if (isAuthPageRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/portfolioManager', nextUrl));
    }
    return;
  }

  // Check if the current route is a protected route
  const isProtectedRoute = PROTECTED_PREFIXES.some(prefix =>
    nextUrl.pathname.startsWith(prefix)
  );

  // Only redirect to login if accessing a protected route while not logged in
  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL('/login', nextUrl));
  }

  // All other routes (homepage, etc.) are public — no redirect
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
