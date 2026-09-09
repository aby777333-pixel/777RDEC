/**
 * Analytics behind an adapter. With no domain configured this is a no-op and
 * no third-party script is ever injected — which is also what the cookie
 * banner promises when consent is declined.
 */
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? ''

export const analyticsEnabled = PLAUSIBLE_DOMAIN.length > 0
export const analyticsDomain = PLAUSIBLE_DOMAIN

type EventProps = Record<string, string | number | boolean>

export function trackEvent(name: string, props?: EventProps): void {
  if (!analyticsEnabled || typeof window === 'undefined') return
  const w = window as unknown as { plausible?: (n: string, o?: { props: EventProps }) => void }
  w.plausible?.(name, props ? { props } : undefined)
}
