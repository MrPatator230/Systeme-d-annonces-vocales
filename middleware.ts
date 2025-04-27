import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Handle audio file requests
  if (path.startsWith('/audio/')) {
    // Add security headers for audio files
    const response = NextResponse.next()
    response.headers.set('Accept-Ranges', 'bytes')
    response.headers.set('Cache-Control', 'public, max-age=31536000') // 1 year
    return response
  }

  // Redirect root to admin panel
  if (path === '/') {
    return NextResponse.redirect(new URL('/admin/banque-de-sons', request.url))
  }

  // Allow all other requests
  return NextResponse.next()
}

// Configure paths that should be handled by middleware
export const config = {
  matcher: [
    '/',
    '/audio/:path*',
    '/admin/:path*'
  ]
}
