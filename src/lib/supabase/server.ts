import 'server-only'

/**
 * Server-side Supabase access.
 *
 * There is deliberately no browser client in this codebase: the lead tables
 * have RLS enabled with no policies, so the anon key cannot touch them. Every
 * write goes through a Server Action using the service role, which never
 * reaches the client bundle.
 *
 * Implemented against the REST endpoint directly rather than pulling in
 * @supabase/supabase-js — three inserts do not justify the dependency.
 */

const SUPABASE_URL = process.env.SUPABASE_URL ?? ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export const supabaseConfigured = SUPABASE_URL.length > 0 && SERVICE_ROLE_KEY.length > 0

export type InsertResult = { ok: true } | { ok: false; reason: 'not_configured' | 'failed' }

export async function insertRow(
  table: 'demo_requests' | 'contact_messages' | 'newsletter_subscribers',
  row: Record<string, unknown>,
  options?: {
    /**
     * Treat a unique-constraint collision as a no-op rather than a failure.
     * Used by the newsletter, where re-subscribing an existing address is the
     * expected outcome and must not read as an error.
     */
    ignoreDuplicates?: boolean
  },
): Promise<InsertResult> {
  if (!supabaseConfigured) {
    // Local development without credentials: log and continue rather than
    // failing the form. Never silently claim success in production.
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[supabase:${table}] not configured, row not persisted`, row)
    }
    return { ok: false, reason: 'not_configured' }
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: options?.ignoreDuplicates
          ? 'return=minimal,resolution=ignore-duplicates'
          : 'return=minimal',
      },
      body: JSON.stringify(row),
      cache: 'no-store',
    })

    if (!response.ok) {
      // Log server-side; never surface a database error to the browser.
      console.error(`[supabase:${table}] insert failed`, response.status, await response.text())
      return { ok: false, reason: 'failed' }
    }
    return { ok: true }
  } catch (error) {
    console.error(`[supabase:${table}] insert threw`, error)
    return { ok: false, reason: 'failed' }
  }
}
