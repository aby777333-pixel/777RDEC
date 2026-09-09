'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Script from 'next/script'
import Link from 'next/link'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { subscribeToNewsletter, type NewsletterState } from '@/lib/forms/newsletter'
import { cn } from '@/lib/utils'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'shrink-0 rounded-ui border border-line-2 bg-bg-2 px-5 py-2.5 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-steel-100',
        'transition-colors duration-200 hover:border-signal hover:text-signal',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
        'disabled:cursor-not-allowed disabled:opacity-60',
      )}
    >
      {pending ? 'Subscribing…' : 'Subscribe'}
    </button>
  )
}

/**
 * Newsletter signup.
 *
 * One field plus an explicit consent checkbox — the consent is not implied by
 * pressing the button, because under UK GDPR it cannot be. Shares the honeypot
 * and Turnstile treatment with the lead forms.
 */
export function NewsletterForm({ className }: { className?: string }) {
  const [state, formAction] = useFormState(subscribeToNewsletter, {
    status: 'idle',
  } as NewsletterState)

  if (state.status === 'success') {
    return (
      <div className={cn('flex items-start gap-3', className)} role="status">
        <CheckCircle2 size={18} strokeWidth={1.5} aria-hidden className="mt-0.5 shrink-0 text-up" />
        <p className="text-[0.9375rem] leading-relaxed text-steel-300">{state.message}</p>
      </div>
    )
  }

  return (
    <>
      {TURNSTILE_SITE_KEY.length > 0 ? (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      ) : null}

      <form action={formAction} className={cn('flex flex-col gap-3', className)} noValidate>
        {/* Honeypot. Off-screen rather than hidden so bots still fill it. */}
        <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
          <label htmlFor="newsletterCompanyWebsite">Company website</label>
          <input
            id="newsletterCompanyWebsite"
            name="companyWebsite"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <label htmlFor="newsletterEmail" className="sr-only">
            Email address
          </label>
          <input
            id="newsletterEmail"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={state.status === 'error'}
            className={cn(
              'min-w-0 flex-1 rounded-ui border bg-bg-0 px-3 py-2.5 text-[0.9375rem] text-steel-100 transition-colors duration-200',
              'placeholder:text-steel-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
              state.status === 'error' ? 'border-down/60' : 'border-line-2 hover:border-steel-700',
            )}
          />
          <SubmitButton />
        </div>

        <label className="flex items-start gap-2.5 text-[0.8125rem] leading-relaxed text-steel-500">
          <input
            name="consent"
            type="checkbox"
            required
            className="mt-1 h-3.5 w-3.5 shrink-0 accent-signal"
          />
          <span>
            Yes, send me occasional updates. I can unsubscribe at any time — see the{' '}
            <Link href="/legal/privacy" className="text-steel-300 underline underline-offset-2">
              privacy notice
            </Link>
            .
          </span>
        </label>

        {TURNSTILE_SITE_KEY.length > 0 ? (
          <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-size="flexible" />
        ) : null}

        {state.status === 'error' ? (
          <p role="alert" className="flex items-start gap-2 text-[0.8125rem] text-down">
            <AlertCircle size={15} strokeWidth={1.5} aria-hidden className="mt-0.5 shrink-0" />
            {state.message}
          </p>
        ) : null}
      </form>
    </>
  )
}
