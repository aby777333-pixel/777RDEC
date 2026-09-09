import 'server-only'

const SECRET = process.env.TURNSTILE_SECRET_KEY ?? ''

export const turnstileEnabled = SECRET.length > 0

/**
 * Verifies a Turnstile token. With no secret configured this returns true —
 * the honeypot is then the only bot control, which is the documented
 * behaviour rather than a silent failure.
 */
export async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  if (!turnstileEnabled) return true
  if (!token || token.length === 0) return false

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: SECRET, response: token }),
      cache: 'no-store',
    })
    if (!response.ok) return false
    const result = (await response.json()) as { success?: boolean }
    return result.success === true
  } catch (error) {
    console.error('[turnstile] verification threw', error)
    return false
  }
}
