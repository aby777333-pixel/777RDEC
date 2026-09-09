'use client'

import { useEffect } from 'react'
import { Button, ButtonLink } from '@/components/ui/button'
import { RaptorLogo } from '@/components/ui/raptor-logo'
import { WingMark } from '@/components/ui/wing-mark'
import { CONTACT_EMAIL } from '@/lib/brand'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app] unhandled error', error)
  }, [error])

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-20">
      <div className="grid-field pointer-events-none absolute inset-0" aria-hidden />
      <WingMark
        className="pointer-events-none absolute -right-24 top-1/4 h-[22rem] w-[40rem] text-steel-700 opacity-40"
        strokeWidth={1}
      />
      <div className="relative flex max-w-xl flex-col items-center gap-8 text-center">
        <RaptorLogo size="md" />
        <p className="font-mono text-[0.75rem] uppercase tracking-[0.18em] text-steel-500">
          500 · Something broke
        </p>
        <h1 className="text-h2 uppercase text-chrome">That didn&rsquo;t work.</h1>
        <p className="text-body text-steel-300">
          An unexpected error stopped this page from rendering. Trying again often clears it. If it
          keeps happening we would genuinely like to know.
        </p>
        {error.digest ? (
          <p className="font-mono text-[0.75rem] text-steel-500" data-numeric>
            Reference: {error.digest}
          </p>
        ) : null}
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="primary" size="lg" onClick={reset}>
            Try again
          </Button>
          <ButtonLink href="/" variant="ghost" size="lg">
            Back to the homepage
          </ButtonLink>
        </div>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-[0.875rem] text-signal underline underline-offset-4"
        >
          {CONTACT_EMAIL}
        </a>
      </div>
    </div>
  )
}
