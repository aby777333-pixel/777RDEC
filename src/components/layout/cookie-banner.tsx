'use client'

import { useCallback, useEffect, useState } from 'react'
import Script from 'next/script'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { analyticsDomain, analyticsEnabled } from '@/lib/analytics'

const KEY = 'raptor-consent'
/** Fired by the footer link so a visitor can revisit a decision they made. */
export const COOKIE_PREFERENCES_EVENT = 'raptor:cookie-preferences'

type Consent = 'granted' | 'denied'

/** Re-open the cookie preferences dialog from anywhere on the page. */
export function openCookiePreferences(): void {
  window.dispatchEvent(new CustomEvent(COOKIE_PREFERENCES_EVENT))
}

/**
 * No non-essential script loads before consent — the Plausible tag is only
 * mounted once consent is explicitly granted.
 *
 * A decision is never final: the footer's "Cookie preferences" control fires
 * COOKIE_PREFERENCES_EVENT, which re-opens this dialog with the stored answer
 * pre-selected. Withdrawing consent unmounts the analytics script on the next
 * render, so it stops collecting immediately rather than at the next reload.
 */
export function CookieBanner() {
  const [consent, setConsent] = useState<Consent | null>(null)
  const [ready, setReady] = useState(false)
  const [reopened, setReopened] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY)
    if (stored === 'granted' || stored === 'denied') setConsent(stored)
    setReady(true)
  }, [])

  useEffect(() => {
    const onOpen = () => setReopened(true)
    window.addEventListener(COOKIE_PREFERENCES_EVENT, onOpen)
    return () => window.removeEventListener(COOKIE_PREFERENCES_EVENT, onOpen)
  }, [])

  const decide = useCallback((value: Consent) => {
    window.localStorage.setItem(KEY, value)
    setConsent(value)
    setReopened(false)
  }, [])

  const open = ready && (consent === null || reopened)

  return (
    <>
      {consent === 'granted' && analyticsEnabled ? (
        <Script
          defer
          data-domain={analyticsDomain}
          src="https://plausible.io/js/script.js"
          strategy="lazyOnload"
        />
      ) : null}

      {open ? (
        <div
          role="dialog"
          aria-label="Cookie preferences"
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-card border border-line-2 bg-bg-1 p-5 shadow-panel md:left-auto md:right-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-[0.875rem] leading-relaxed text-steel-300">
              We use essential cookies to run this site. With your consent we also measure aggregate,
              anonymous usage to improve it. See our{' '}
              <Link href="/legal/cookies" className="text-signal underline underline-offset-2">
                cookie notice
              </Link>
              .
              {reopened && consent !== null ? (
                <span className="mt-1 block text-steel-500">
                  Your current choice is{' '}
                  <strong className="font-medium text-steel-300">
                    {consent === 'granted' ? 'Accept' : 'Essential only'}
                  </strong>
                  .
                </span>
              ) : null}
            </p>
            <div className="flex shrink-0 gap-2">
              <Button variant="ghost" size="sm" onClick={() => decide('denied')}>
                Essential only
              </Button>
              <Button variant="primary" size="sm" onClick={() => decide('granted')}>
                Accept
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

/** Footer control that re-opens the dialog above. */
export function CookiePreferencesButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openCookiePreferences} className={className}>
      Cookie preferences
    </button>
  )
}
