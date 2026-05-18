/**
 * Next.js Edge Middleware — first line of route protection.
 *
 * Runs on the Vercel Edge Network before any server code.
 * Verifies the JWT and enforces role-based route access.
 *
 * /admin/*     → requires valid session with role === 'admin'
 * /dashboard/* → requires any valid session
 *
 * API routes and public pages are excluded via the matcher config.
 */

import { withAuth } from 'next-auth/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import type { JWT } from 'next-auth/jwt'

export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: JWT | null } }) {
    const { pathname } = req.nextUrl
    const token        = req.nextauth.token

    // Admin routes — bounce non-admins
    if (pathname.startsWith('/admin') && token?.role !== 'admin') {
      const dest = token ? '/dashboard' : '/login'
      return NextResponse.redirect(new URL(dest, req.url))
    }

    // Student dashboard — redirect admin to their panel
    if (pathname.startsWith('/dashboard') && token?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Return false → withAuth redirects to the signIn page
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: '/login' },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
