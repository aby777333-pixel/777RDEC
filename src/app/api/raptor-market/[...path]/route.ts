import { NextResponse, type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Read-only proxy from the EMIL apps (served as static files from
 * /emil-<app>/, see src/lib/emil-apps.ts) to the Raptor Market API. Shared by
 * every app: `/api/raptor-market/<path>` forwards to `<origin>/api/<path>`.
 *
 * The market API lives on its own origin and does not send CORS headers, so the
 * browser cannot call it from this site directly. Only the GET endpoints the
 * apps read are forwarded; anything else — key issuance, writes, unknown
 * paths — is a 404 here. Responses are held briefly at the CDN so every open
 * app tab does not become an upstream request.
 */
const MARKET_API_ORIGIN = (process.env.RAPTOR_MARKET_API_ORIGIN ?? 'https://dashing-hamster-0028ed.netlify.app')
  .trim()
  .replace(/\/+$/, '')

const ROUTES: readonly { pattern: RegExp; cdnSeconds: number }[] = [
  { pattern: /^market\/health$/, cdnSeconds: 60 },
  { pattern: /^markets$/, cdnSeconds: 5 },
  { pattern: /^market\/quote$/, cdnSeconds: 5 },
  { pattern: /^market\/candles$/, cdnSeconds: 30 },
  { pattern: /^market\/search$/, cdnSeconds: 300 },
  { pattern: /^market-data\/[A-Za-z0-9._:^=-]{1,32}$/, cdnSeconds: 30 },
]

const MAX_QUERY_LENGTH = 512
const UPSTREAM_TIMEOUT_MS = 8000

function failure(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store, max-age=0' } })
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/')
  const route = ROUTES.find(({ pattern }) => pattern.test(path))
  if (!route) return failure(404, 'Not found')

  const search = request.nextUrl.search
  if (search.length > MAX_QUERY_LENGTH) return failure(414, 'Query too long')

  let upstream: Response
  try {
    upstream = await fetch(`${MARKET_API_ORIGIN}/api/${path}${search}`, {
      cache: 'no-store',
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })
  } catch {
    return failure(502, 'Market data unavailable')
  }

  // Never pass an upstream HTML error page through as if it were data.
  if (!(upstream.headers.get('content-type') ?? '').includes('application/json')) {
    return failure(502, 'Market data unavailable')
  }

  const body = await upstream.text()
  const cdnSeconds = upstream.ok ? route.cdnSeconds : 0
  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Netlify-CDN-Cache-Control':
        cdnSeconds > 0 ? `public, s-maxage=${cdnSeconds}, stale-while-revalidate=${cdnSeconds * 6}` : 'no-store',
    },
  })
}
