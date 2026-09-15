/**
 * Analytics behind an adapter. With no domain configured this is a no-op and
 * no third-party script is ever injected — which is also what the cookie
 * banner promises when consent is declined.
 */
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? ''

export const analyticsEnabled = PLAUSIBLE_DOMAIN.length > 0
export const analyticsDomain = PLAUSIBLE_DOMAIN

/**
 * Google Tag Manager container, e.g. GTM-ABC1234. Unset (or malformed) means
 * no GTM script at all. Like Plausible it loads only after consent is granted.
 *
 * Before publishing advertising or remarketing tags (Google Ads, LinkedIn
 * Insight, Meta) through the container, the cookie banner copy and
 * /legal/cookies must be updated to say so: today they describe aggregate,
 * anonymous measurement only. GTM cannot be unloaded from a live page, so a
 * withdrawal of consent takes full effect from the next page load.
 */
const RAW_GTM_ID = (process.env.NEXT_PUBLIC_GTM_ID ?? '').trim()
export const gtmId = /^GTM-[A-Z0-9]+$/.test(RAW_GTM_ID) ? RAW_GTM_ID : ''
export const gtmEnabled = gtmId.length > 0

type EventProps = Record<string, string | number | boolean>

export function trackEvent(name: string, props?: EventProps): void {
  if (typeof window === 'undefined') return
  if (analyticsEnabled) {
    const w = window as unknown as { plausible?: (n: string, o?: { props: EventProps }) => void }
    w.plausible?.(name, props ? { props } : undefined)
  }
  if (gtmEnabled) {
    // dataLayer only exists once GTM has loaded, i.e. after consent.
    const w = window as unknown as { dataLayer?: Record<string, unknown>[] }
    w.dataLayer?.push({ event: name, ...props })
  }
}
