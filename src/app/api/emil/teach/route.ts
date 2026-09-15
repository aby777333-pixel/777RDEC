import { NextResponse, type NextRequest } from 'next/server'
import { validateSpec } from '../../../../../packages/emil-strategy-kit/src'

export const dynamic = 'force-dynamic'

/**
 * Sends a strategy from the EMIL Strategy Builder to EMIL for review.
 *
 * The builder on this site is a public demo, so everything that reaches EMIL
 * from here is treated as untrusted research input:
 *   - the spec is validated with the shared strategy kit before it leaves;
 *   - requests must come from this site, are size-capped and rate-limited;
 *   - the Cockpit API key never reaches the browser;
 *   - the Cockpit stores it as a LEARNED blueprint, which only moves forward
 *     through the Strategy Lab and a human approval. Nothing trades from it.
 *
 * Switched off (503) until EMIL_COCKPIT_URL and EMIL_COCKPIT_API_KEY are set.
 */

const MAX_BODY_BYTES = 16_000
const UPSTREAM_TIMEOUT_MS = 8000

// Best effort: counters live per server instance.
const WINDOW_MS = 10 * 60 * 1000
const PER_CLIENT = 12
const PER_INSTANCE = 300
const hits = new Map<string, number[]>()

function rateLimited(client: string): boolean {
  const now = Date.now()
  const recent = (key: string) => (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  const mine = recent(client)
  const all = recent('*')
  if (mine.length >= PER_CLIENT || all.length >= PER_INSTANCE) return true
  hits.set(client, [...mine, now])
  hits.set('*', [...all, now])
  if (hits.size > 5000) hits.clear()
  return false
}

function reply(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store, max-age=0' } })
}

export async function POST(request: NextRequest) {
  const cockpitUrl = (process.env.EMIL_COCKPIT_URL ?? '').trim().replace(/\/+$/, '')
  const apiKey = (process.env.EMIL_COCKPIT_API_KEY ?? '').trim()
  if (!cockpitUrl || !apiKey) {
    return reply(503, { error: 'Sending to EMIL is not switched on for this site yet. The strategy is saved in your browser.' })
  }

  const origin = request.headers.get('origin')
  if (origin && new URL(origin).host !== request.nextUrl.host) return reply(403, { error: 'Cross-site requests are not accepted.' })

  const client = request.headers.get('x-nf-client-connection-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (rateLimited(client)) return reply(429, { error: 'Too many strategies sent just now.' })

  const text = await request.text()
  if (text.length > MAX_BODY_BYTES) return reply(413, { error: 'Request too large.' })
  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    return reply(400, { error: 'Request body must be JSON.' })
  }
  const checked = validateSpec((body as { spec?: unknown } | null)?.spec)
  if (!checked.ok) return reply(422, { error: checked.errors.slice(0, 3).join(' ') })

  let upstream: Response
  try {
    upstream = await fetch(`${cockpitUrl}/api/v1/strategies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({ spec: checked.spec, channel: 'public-site' }),
      cache: 'no-store',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })
  } catch {
    return reply(502, { error: 'EMIL could not be reached.' })
  }

  const result = (await upstream.json().catch(() => null)) as { code?: string; version?: string; duplicate?: boolean; error?: string } | null
  if (upstream.ok) {
    return reply(upstream.status === 201 ? 201 : 200, { ok: true, code: result?.code, version: result?.version, duplicate: result?.duplicate === true })
  }
  if (upstream.status === 429) return reply(429, { error: 'EMIL is receiving too many strategies just now.' })
  if (upstream.status === 400 || upstream.status === 422) return reply(422, { error: String(result?.error ?? 'EMIL did not accept the strategy.').slice(0, 300) })
  // Key or scope problems are configuration, not the visitor's doing.
  console.error('EMIL teach: cockpit responded', upstream.status, result?.error)
  return reply(503, { error: 'Sending to EMIL is temporarily unavailable. The strategy is saved in your browser.' })
}
