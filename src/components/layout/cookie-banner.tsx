'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { analyticsDomain, analyticsEnabled } from '@/lib/analytics'

const KEY = 'raptor-consent'
type Consent = 'granted' | 'denied'

/**
 * No non-essential script loads before consent — the Plausible tag is only
 * mounted once consent is explicitly granted.
 */
export function CookieBanner() {
  const [consent, setConsent] = useState<Consent | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY)
    if (stored === 'granted' || stored === 'denied') setConsent(stored)
    setReady(true)
  }, [])

  function decide(value: Consent) {
    window.localStorage.setItem(KEY, value)
    setConsent(value)
  }

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

      {ready && consent === null ? (
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
