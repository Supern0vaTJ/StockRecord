import NextAuth from 'next-auth'
import authConfig from './auth.config'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPageRoute = req.nextUrl.pathname.startsWith('/login');
  
  if (isAuthPageRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/', req.nextUrl));
    }
    return;
  }

  // If not logged in and not on auth page, redirect to login
  if (!isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl));
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
