import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const MAIN_DOMAINS = ['fulltiime.com', 'www.fulltiime.com']

export function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname

  if (MAIN_DOMAINS.includes(hostname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/coming-soon'
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|coming-soon|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico).*)',
  ],
}
