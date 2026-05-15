import { NextRequest, NextResponse } from 'next/server'

// Only protect routes when Supabase is configured.
// When running in demo mode (no Supabase env vars), auth is handled
// client-side in the dashboard layout via Zustand.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const supabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Without Supabase, rely on client-side Zustand auth guard in the layout
  if (!supabaseConfigured) return NextResponse.next()

  const PUBLIC_ROUTES = ['/', '/login', '/signup']
  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next()

  // Check for Supabase session cookie (set automatically after OAuth/signIn)
  const hasSession = [...req.cookies.getAll()].some(
    c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  )

  if (!hasSession) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icons).*)'],
}
