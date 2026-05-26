import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const MAIN_DOMAIN = 'fulltiime.com'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const { pathname } = request.nextUrl

  console.log(`[Middleware] Host: ${hostname} | Path: ${pathname}`)

  const isMainDomain = hostname.includes(MAIN_DOMAIN)
  const isBetaOrDev  = hostname.startsWith('beta.') || hostname.startsWith('dev.')

  if (isMainDomain && !isBetaOrDev) {
    // Root → rewrite to coming-soon (URL stays as fulltiime.com)
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/coming-soon', request.url))
    }

    // Any other path → redirect back to root so nobody bypasses via /news etc.
    const isInternal = pathname.startsWith('/_next') ||
                       pathname.startsWith('/api')   ||
                       pathname.startsWith('/coming-soon')

    if (!isInternal) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
